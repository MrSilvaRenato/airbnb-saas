<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Checkout\Session;
use App\Models\RefundRequest;
use Carbon\Carbon;

class BillingController extends Controller
{
    /**
     * POST /billing/checkout
     * Route name: billing.checkout
     *
     * Creates (or reuses) a Stripe customer for this user,
     * creates a Checkout Session for the Pro subscription,
     * and then redirects them to Stripe Checkout.
     */
    public function upgrade(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        $plan = $request->input('plan', 'growth'); // 'growth', 'pro', or 'agency'
        $priceId = match($plan) {
            'pro'    => config('stripe.price_pro'),
            'agency' => config('stripe.price_agency'),
            default  => config('stripe.price_growth'), // growth
        };

        if (!$priceId) {
            abort(500, 'Stripe price not configured.');
        }

        Stripe::setApiKey(config('stripe.secret'));

        if (!$user->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $user->email,
                'name'  => $user->name ?? 'Host',
            ]);
            $user->stripe_customer_id = $customer->id;
            $user->save();
        }

        $session = Session::create([
            'mode'     => 'subscription',
            'customer' => $user->stripe_customer_id,
            'line_items' => [[
                'price'    => $priceId,
                'quantity' => 1,
            ]],
            'success_url' => route('host.dashboard', ['upgraded' => 1]),
            'cancel_url'  => route('checkout.show'),
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * GET /billing/success
     * Route name: billing.success
     *
     * User returns here after successful Stripe Checkout.
     * We do NOT trust this page alone to "flip them to pro".
     * The source of truth is the webhook.
     */
public function success(Request $request)
{
    $user = $request->user();

    return Inertia::render('Billing/Success', [
        'plan' => $user->plan ?? 'free',
        'message' => match($user->plan) {
            'pro'           => "You're on Pro. Unlimited properties, full analytics, maintenance tracking, and upsells unlocked.",
            'agency'        => "You're on Agency. Everything unlocked.",
            'growth', 'host'=> "You're on Growth. Up to 5 properties, iCal sync, automated messaging, upsells, and branding unlocked.",
            default         => "Payment complete. We're finalizing your upgrade…",
        },
    ]);
}

    /**
     * GET /billing/cancel
     * Route name: billing.cancel
     *
     * User backed out of Stripe Checkout.
     */
    public function cancel(Request $request)
    {
        return Inertia::render('Billing/Cancel', [
            'message' => "You didn't upgrade. You're still on Free.",
        ]);
    }

    /**
     * POST /billing/portal
     * Route name: billing.portal
     *
     * Creates a Stripe Customer Portal session and redirects the user.
     * Requires Stripe Customer Portal to be enabled in the Stripe Dashboard.
     */
    public function portal(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            return redirect()->route('checkout.show')
                ->with('error', 'No active subscription found.');
        }

        \Stripe\Stripe::setApiKey(config('stripe.secret'));

        $session = \Stripe\BillingPortal\Session::create([
            'customer'   => $user->stripe_customer_id,
            'return_url' => route('billing.manage'),
        ]);

        return redirect($session->url);
    }

    /**
     * GET /billing/manage
     * Route name: billing.manage
     *
     * Shows the billing management page with current plan info
     * and a link to the Stripe Customer Portal.
     */
    public function manage(Request $request)
    {
        $user = $request->user();

        $pendingRefund = RefundRequest::where('user_id', $user->id)
            ->where('status', 'pending')->exists();

        $daysSubscribed = $user->subscription_started_at
            ? Carbon::parse($user->subscription_started_at)->diffInDays(now())
            : null;

        $canRequestRefund = $user->stripe_subscription_id
            && !$pendingRefund
            && $daysSubscribed !== null
            && $daysSubscribed <= 7;

        return \Inertia\Inertia::render('Billing/Manage', [
            'plan'                => $user->plan ?? 'free',
            'stripeStatus'        => $user->stripe_status,
            'planRenewsAt'        => $user->plan_renews_at?->toDateString(),
            'planEndsAt'          => $user->plan_ends_at?->toDateString(),
            'hasStripeCustomer'   => (bool) $user->stripe_customer_id,
            'hasStripeSubscription' => (bool) $user->stripe_subscription_id,
            'canRequestRefund'    => $canRequestRefund,
            'pendingRefund'       => $pendingRefund,
            'daysSubscribed'      => $daysSubscribed,
            'checkoutRoute'       => route('billing.checkout'),
            'portalRoute'         => route('billing.portal'),
        ]);
    }

    /**
     * POST /billing/cancel
     * Cancels at period end — user keeps access until plan_ends_at.
     */
    public function cancelSubscription(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_subscription_id) {
            return back()->with('error', 'No active subscription found.');
        }

        \Stripe\Stripe::setApiKey(config('stripe.secret'));

        \Stripe\Subscription::update($user->stripe_subscription_id, [
            'cancel_at_period_end' => true,
        ]);

        // plan_ends_at will be confirmed by webhook, but set optimistically
        if ($user->plan_renews_at) {
            $user->plan_ends_at = $user->plan_renews_at;
            $user->save();
        }

        return back()->with('success', 'Subscription cancelled. You keep access until the end of your billing period.');
    }

    /**
     * POST /billing/refund-request
     * Submit a refund request — admin must approve.
     */
    public function refundRequest(Request $request)
    {
        $request->validate(['reason' => 'required|string|min:10|max:1000']);

        $user = $request->user();

        if (!$user->stripe_subscription_id) {
            return back()->with('error', 'No active subscription found.');
        }

        $existing = RefundRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])->exists();

        if ($existing) {
            return back()->with('error', 'You already have a refund request in progress.');
        }

        $daysSubscribed = $user->subscription_started_at
            ? Carbon::parse($user->subscription_started_at)->diffInDays(now())
            : 999;

        if ($daysSubscribed > 7) {
            return back()->with('error', 'Refund requests are only accepted within 7 days of subscribing.');
        }

        RefundRequest::create([
            'user_id'                => $user->id,
            'plan'                   => $user->plan,
            'amount'                 => match($user->plan) { 'pro' => 79, 'agency' => 199, 'growth' => 29, 'host' => 29, default => 0 },
            'reason'                 => $request->reason,
            'status'                 => 'pending',
            'subscription_started_at' => $user->subscription_started_at,
        ]);

        return back()->with('success', 'Refund request submitted. Our team will review and respond within 1–2 business days.');
    }

    /**
     * POST /billing/upgrade-subscription
     * Upgrades an existing Stripe subscription to a new price (with proration).
     */
    public function upgradeSubscription(Request $request)
    {
        $request->validate(['plan' => 'required|in:growth,pro,agency,host']); // host kept for legacy

        $user = $request->user();
        $plan = $request->plan === 'host' ? 'growth' : $request->plan; // normalize legacy

        $priceId = match($plan) {
            'pro'    => config('stripe.price_pro'),
            'agency' => config('stripe.price_agency'),
            default  => config('stripe.price_growth'),
        };

        \Stripe\Stripe::setApiKey(config('stripe.secret'));

        // If existing subscription, update it (proration)
        if ($user->stripe_subscription_id) {
            $subscription = \Stripe\Subscription::retrieve($user->stripe_subscription_id);
            \Stripe\Subscription::update($user->stripe_subscription_id, [
                'items' => [[
                    'id'    => $subscription->items->data[0]->id,
                    'price' => $priceId,
                ]],
                'proration_behavior' => 'create_prorations',
            ]);

            $user->plan = $plan;
            $user->save();

            return response()->json(['success' => true]);
        }

        // No existing subscription — start new checkout
        if (!$user->stripe_customer_id) {
            $customer = Customer::create(['email' => $user->email, 'name' => $user->name ?? 'Host']);
            $user->stripe_customer_id = $customer->id;
            $user->save();
        }

        $session = Session::create([
            'mode'       => 'subscription',
            'customer'   => $user->stripe_customer_id,
            'line_items' => [['price' => $priceId, 'quantity' => 1]],
            'success_url' => route('host.dashboard', ['upgraded' => 1]),
            'cancel_url'  => route('billing.manage'),
        ]);

        return response()->json(['url' => $session->url]);
    }
}