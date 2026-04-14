<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;
use Carbon\Carbon;
use App\Models\User;
use App\Models\UpsellOrder;

class StripeWebhookController extends Controller
{
    /**
     * POST /stripe/webhook
     * This must be publicly accessible (no auth middleware).
     */
    public function handle(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $secret
            );
        } catch (UnexpectedValueException $e) {
            Log::warning('Stripe webhook: invalid payload', ['err' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook: invalid signature', ['err' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                $this->syncSubscriptionToUser($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->downgradeUserToFree($event->data->object);
                break;

            default:
                Log::info('Stripe webhook: unhandled event type', [
                    'type' => $event->type,
                ]);
        }

        return response('ok', 200);
    }

    /**
     * Handle payment_intent.succeeded — mark upsell order as paid.
     */
    protected function handlePaymentIntentSucceeded($intent)
    {
        $order = UpsellOrder::where('stripe_payment_intent_id', $intent->id)
            ->orWhere(function ($q) {
                $q->where('status', 'pending')
                  ->whereNotNull('stripe_session_id');
            })
            ->where('status', 'pending')
            ->first();

        if (!$order) {
            return;
        }

        $order->update([
            'stripe_payment_intent_id' => $intent->id,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        try {
            $host = $order->offer->property->user;
            $net = number_format($order->amount - $order->commission, 2);

            \Illuminate\Support\Facades\Mail::raw(
                "New paid upsell! 🎉\n\nOffer: {$order->offer->title}\nGuest: {$order->guest_name} <{$order->guest_email}>\nAmount paid: A\${$order->amount}\nYour earnings: A\${$net} (after 15% platform fee)\n\nView orders: " . url('/host/properties/' . $order->offer->property_id . '/upsells'),
                fn ($m) => $m->to($host->email)->subject("Payment received: {$order->offer->title}")
            );

            $order->update(['host_notified_at' => now()]);
        } catch (\Throwable $e) {
            Log::warning('Stripe webhook: failed to notify upsell host', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Called after checkout completes.
     * Handles both subscription checkouts AND upsell one-time payments.
     */
    protected function handleCheckoutSessionCompleted($session)
    {
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

        if (!empty($session->subscription)) {
            $plan = $session->metadata->plan ?? null;
            $validPlans = ['growth', 'pro', 'agency'];

            if ($plan && in_array($plan, $validPlans, true)) {
                $user->plan = $plan;
                $user->stripe_subscription_id = $session->subscription;
                $user->stripe_status = 'active';

                if (!$user->subscription_started_at) {
                    $user->subscription_started_at = now();
                }

                $user->save();

                Log::info('Stripe webhook: plan activated via checkout.session.completed', [
                    'user' => $user->id,
                    'plan' => $plan,
                ]);
            } else {
                $user->stripe_subscription_id = $session->subscription;
                $user->save();
            }
        }

        $orderId = $session->metadata->upsell_order_id ?? null;

        if ($orderId) {
            $order = UpsellOrder::find($orderId);

            if ($order && $order->status === 'pending') {
                $order->update([
                    'stripe_payment_intent_id' => $session->payment_intent,
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);

                try {
                    $host = $order->offer->property->user;
                    $net = number_format($order->amount - $order->commission, 2);

                    \Illuminate\Support\Facades\Mail::raw(
                        "New paid upsell! 🎉\n\nOffer: {$order->offer->title}\nGuest: {$order->guest_name} <{$order->guest_email}>\nAmount: A\${$order->amount}\nYour earnings: A\${$net} (after 15% fee)\n\nView: " . url('/host/properties/' . $order->offer->property_id . '/upsells'),
                        fn ($m) => $m->to($host->email)->subject("Payment received: {$order->offer->title}")
                    );

                    $order->update(['host_notified_at' => now()]);
                } catch (\Throwable $e) {
                    Log::warning('Stripe webhook: failed to notify upsell host after checkout', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    /**
     * Map Stripe subscription -> our User billing columns.
     */
    protected function syncSubscriptionToUser($subscription)
    {
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

        $status = $subscription->status;
        $renewsAt = null;

        if (!empty($subscription->current_period_end)) {
            $renewsAt = Carbon::createFromTimestamp($subscription->current_period_end);
        }

        $priceId = $subscription->items->data[0]->price->id ?? null;
        $priceGrowth = config('stripe.price_growth');
        $pricePro = config('stripe.price_pro');
        $priceAgency = config('stripe.price_agency');
        $priceHost = config('stripe.price_host');

        if ($priceId === $pricePro) {
            $planValue = 'pro';
        } elseif ($priceId === $priceAgency) {
            $planValue = 'agency';
        } elseif ($priceId === $priceGrowth || $priceId === $priceHost) {
            $planValue = 'growth';
        } else {
            $planValue = 'growth';
        }

        $cancelAtPeriodEnd = $subscription->cancel_at_period_end ?? false;

        if (in_array($status, ['active', 'trialing', 'past_due'], true)) {
            $user->plan = $planValue;
            $user->stripe_status = $status;
            $user->stripe_subscription_id = $subscription->id;
            $user->plan_renews_at = $renewsAt;
            $user->plan_ends_at = $cancelAtPeriodEnd ? $renewsAt : null;

            if (!$user->subscription_started_at) {
                $user->subscription_started_at = !empty($subscription->start_date)
                    ? Carbon::createFromTimestamp($subscription->start_date)
                    : now();
            }
        } else {
            $user->plan = 'free';
            $user->stripe_status = $status;
            $user->stripe_subscription_id = $subscription->id;
            $user->plan_renews_at = null;
            $user->plan_ends_at = null;
        }

        $user->save();

        Log::info('Stripe webhook: subscription synced', [
            'user' => $user->id,
            'customer' => $subscription->customer,
            'subscription_id' => $subscription->id,
            'status' => $status,
            'price_id' => $priceId,
            'plan' => $user->plan,
        ]);
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

        $user->plan = 'free';
        $user->stripe_status = $subscription->status ?? 'canceled';
        $user->plan_renews_at = null;
        $user->plan_ends_at = now();

        $user->save();

        Log::info('Stripe webhook: user downgraded to free', [
            'user' => $user->id,
            'customer' => $subscription->customer,
            'subscription_id' => $subscription->id ?? null,
            'status' => $subscription->status ?? 'canceled',
        ]);
    }
}
