<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Event as StripeEvent;
use Stripe\Subscription;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;
use Carbon\Carbon;
use App\Models\User;

class StripeWebhookController extends Controller
{
    /**
     * POST /stripe/webhook
     * This must be publicly accessible (no auth middleware).
     */
    public function handle(Request $request)
    {
        // 1. Verify webhook signature (security)
        $payload    = $request->getContent();
        $sigHeader  = $request->header('Stripe-Signature');
        $secret     = config('stripe.webhook_secret'); // STRIPE_WEBHOOK_SECRET in .env

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $secret
            );
        } catch (UnexpectedValueException $e) {
            // Invalid payload
            Log::warning('Stripe webhook: invalid payload', ['err' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::warning('Stripe webhook: invalid signature', ['err' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        // 2. We only really care about subscription lifecycle events
        //    These are the core ones for SaaS:
        //
        //    - checkout.session.completed
        //    - customer.subscription.created
        //    - customer.subscription.updated
        //    - customer.subscription.deleted (cancellations / churn)

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                $this->syncSubscriptionToUser($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->downgradeUserToFree($event->data->object);
                break;

            default:
                // You can log other events if you like during dev:
                Log::info('Stripe webhook: unhandled event type', [
                    'type' => $event->type,
                ]);
        }

        // 3. Stripe expects a 200 OK if we handled it
        return response('ok', 200);
    }

    /**
     * Called after checkout completes.
     * We can grab the subscription ID from the session and sync.
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        // $session->customer = 'cus_123...'
        // $session->subscription = 'sub_123...'
        if (!$session->customer) {
            return;
        }

        $user = User::where('stripe_customer_id', $session->customer)->first();
        if (!$user) {
            Log::warning('Stripe webhook: no user for checkout.session.completed', [
                'customer' => $session->customer,
            ]);
            return;
        }

        // You can save subscription_id early here, but final truth
        // will be in customer.subscription.* events anyway.
        if ($session->subscription) {
            $user->stripe_subscription_id = $session->subscription;
        }

        // We don't flip plan here yet, we'll flip in syncSubscriptionToUser
        // after we pull full subscription object.
        $user->save();
    }

    /**
     * Map Stripe subscription -> our User billing columns.
     */
    protected function syncSubscriptionToUser($subscription)
    {
        // subscription has:
        //  - customer (cus_xxx)
        //  - status ('active', 'trialing', 'canceled', etc.)
        //  - current_period_end (unix timestamp)

        if (!$subscription->customer) {
            return;
        }

        $user = User::where('stripe_customer_id', $subscription->customer)->first();
        if (!$user) {
            Log::warning('Stripe webhook: no user for subscription sync', [
                'customer' => $subscription->customer,
            ]);
            return;
        }

        // status from Stripe
        $status = $subscription->status; // e.g. 'active', 'trialing', 'past_due', 'canceled'

        // renewal date
        $renewsAt = null;
        if (!empty($subscription->current_period_end)) {
            $renewsAt = Carbon::createFromTimestamp($subscription->current_period_end);
        }

        // Determine which plan from the Stripe price ID
        $priceId   = $subscription->items->data[0]->price->id ?? null;
        $planValue = match(true) {
            $priceId === config(‘stripe.price_pro’)  => ‘pro’,
            $priceId === config(‘stripe.price_host’) => ‘host’,
            default                                  => ‘host’, // fallback for legacy price_id
        };

        $cancelAtPeriodEnd = $subscription->cancel_at_period_end ?? false;

        if (in_array($status, [‘active’, ‘trialing’, ‘past_due’])) {
            $user->plan                   = $planValue;
            $user->stripe_status          = $status;
            $user->stripe_subscription_id = $subscription->id;
            $user->plan_renews_at         = $renewsAt;
            $user->plan_ends_at           = $cancelAtPeriodEnd ? $renewsAt : null;

            // Record subscription start date once
            if (!$user->subscription_started_at) {
                $startedAt = !empty($subscription->start_date)
                    ? Carbon::createFromTimestamp($subscription->start_date)
                    : now();
                $user->subscription_started_at = $startedAt;
            }
        } else {
            $user->plan                   = ‘free’;
            $user->stripe_status          = $status;
            $user->stripe_subscription_id = $subscription->id;
            $user->plan_renews_at         = null;
            $user->plan_ends_at           = null;
        }

        $user->save();
    }

    /**
     * Handle cancellation: customer.subscription.deleted
     */
    protected function downgradeUserToFree($subscription)
    {
        if (!$subscription->customer) {
            return;
        }

        $user = User::where('stripe_customer_id', $subscription->customer)->first();
        if (!$user) {
            return;
        }

        $user->plan                   = 'free';
        $user->stripe_status          = $subscription->status ?? 'canceled';
        $user->plan_renews_at         = null;
        // keep stripe_subscription_id for history if you want

        $user->save();
    }
}
