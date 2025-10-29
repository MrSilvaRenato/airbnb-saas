<?php

return [
    // Secret key (sk_test_xxx)
    'secret' => env('STRIPE_SECRET', ''),

    // Publishable key (pk_test_xxx) - mostly for front end if you ever add card elements
    'public' => env('STRIPE_PUBLIC', ''),

    // Webhook signing secret (whsec_xxx)
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),

    // Price ID for Pro monthly subscription (price_xxx from Stripe dashboard)
    'price_id' => env('STRIPE_PRICE_PRO', ''),

    // Optional override URLs (you actually don't need these because you're already using route())
    'success_url' => env('STRIPE_SUCCESS_URL', ''),
    'cancel_url'  => env('STRIPE_CANCEL_URL', ''),
];
