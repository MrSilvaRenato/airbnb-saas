<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Checkout\Session;

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

        $plan = $request->input('plan', 'host'); // 'host' or 'pro'
        $priceId = $plan === 'pro'
            ? config('stripe.price_pro')
            : config('stripe.price_host');

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
        'message' => $user->plan === 'pro'
            ? "You're on Pro. Unlimited properties, maintenance tracking, and guest auto-communication are unlocked."
            : ($user->plan === 'host'
                ? "You're on Host. Up to 5 properties and branding are unlocked."
                : "Payment complete. We're finalizing your upgrade…"),
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

        return \Inertia\Inertia::render('Billing/Manage', [
            'plan'              => $user->plan ?? 'free',
            'hasStripeCustomer' => (bool) $user->stripe_customer_id,
            'checkoutRoute'     => route('billing.checkout'),
            'portalRoute'       => route('billing.portal'),
        ]);
    }
}