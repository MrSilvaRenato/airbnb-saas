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

        // must be logged in
        if (!$user) {
            abort(403);
        }

        // load Stripe key
        Stripe::setApiKey(config('stripe.secret'));

        // ensure we have a Stripe customer for this user
        if (!$user->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $user->email,
                'name'  => $user->name ?? 'Host',
            ]);

            $user->stripe_customer_id = $customer->id;
            $user->save();
        }

        // Build Checkout Session for subscription
        // This assumes you are selling a recurring plan with Stripe Billing
        $session = Session::create([
            'mode' => 'subscription',
            'customer' => $user->stripe_customer_id,
            'line_items' => [[
                'price'    => config('stripe.price_id'), // e.g. price_abc123 from Stripe dashboard
                'quantity' => 1,
            ]],
                'success_url' => route('host.dashboard', ['upgraded' => 1]),
                'cancel_url'  => route('checkout.show'),
        ]);

        // Redirect straight to Stripe Checkout hosted page
        return redirect($session->url);
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
            ? "You're on Pro. Branding and unlimited stays are unlocked."
            : "Payment complete. We're finalizing your upgrade…",
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
}}