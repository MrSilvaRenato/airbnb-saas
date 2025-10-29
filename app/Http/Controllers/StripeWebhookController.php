<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Webhook;
use Carbon\Carbon;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        $secret = config('stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $secret
            );
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'invalid signature'], 400);
        }

        // We care about subscription events. The object is usually a Subscription.
        $type = $event->type;
        $data = $event->data['object'];

        // $data->customer  -> Stripe customer ID
        // $data->status    -> 'active', 'canceled', 'past_due', etc.
        // $data->current_period_end -> unix timestamp next renewal

        if (in_array($type, [
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
        ])) {
            $this->syncUserFromStripeSubscription($data);
        }

        return response()->json(['ok' => true], 200);
    }

    protected function syncUserFromStripeSubscription($stripeSub)
    {
        $user = User::where('stripe_customer_id', $stripeSub->customer)->first();

        if (!$user) {
            return;
        }

        $user->stripe_subscription_id = $stripeSub->id;
        $user->stripe_status          = $stripeSub->status;
        $user->plan_renews_at         = Carbon::createFromTimestamp($stripeSub->current_period_end);

        // If Stripe says active/ trialing -> mark us as pro
        if (in_array($stripeSub->status, ['active','trialing','past_due'])) {
            $user->plan = 'pro';
        } else {
            // canceled / unpaid etc. -> go back to free
            $user->plan = 'free';
        }

        $user->save();
    }
}
