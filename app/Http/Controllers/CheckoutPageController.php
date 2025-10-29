<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutPageController extends Controller
{
    /**
     * Display the Free vs Pro upgrade page.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Checkout', [
            'userPlan' => $user->plan ?? 'free', // fallback for safety

            'limits' => [
                'free' => [
                    'max_properties' => 1,
                    'branding' => false,
                    'analytics' => true,
                    'price' => 0,
                ],
                'pro' => [
                    'max_properties' => 'Unlimited',
                    'branding' => true,
                    'analytics' => true,
                    'price' => 19, // your displayed monthly price (for now)
                ],
            ],

            // existing Stripe checkout route that starts CheckoutSession
            'checkoutRoute' => route('billing.checkout'),
        ]);
    }
}
