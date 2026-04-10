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
            'userPlan'      => $user->plan ?? 'free',
            'checkoutRoute' => route('billing.checkout'),
        ]);
    }
}
