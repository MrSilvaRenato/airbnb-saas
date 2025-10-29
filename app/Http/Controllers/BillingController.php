<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;

class BillingController extends Controller
{
    public function upgrade(Request $request)
    {
        $user = Auth::user();

        // 1. Ensure we have/make a Stripe customer
        Stripe::setApiKey(config('stripe.secret'));

        if (!$user->stripe_customer_id) {
            $customer = \Stripe\Customer::create([
                'email' => $user->email,
                'name'  => $user->name ?? 'Host',
            ]);

            $user->stripe_customer_id = $customer->id;
            $user->save();
        }

        // 2. Create checkout session for a recurring subscription to PRO
        $session = CheckoutSession::create([
            'mode' => 'subscription',
            'customer' => $user->stripe_customer_id,
            'line_items' => [[
                'price'    => config('stripe.price_pro'),
                'quantity' => 1,
            ]],
            'success_url' => config('stripe.success_url'),
            'cancel_url'  => config('stripe.cancel_url'),
        ]);

        // 3. Return the session id to React so frontend can redirect to Stripe
        return response()->json([
            'checkout_url' => $session->url,
        ]);
    }

    public function success()
    {
        // We'll just render a “Success, you're Pro now” Inertia page.
        return inertia('Billing/Success');
    }

    public function cancel()
    {
        return inertia('Billing/Cancel');
    }
}
