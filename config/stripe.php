<?php

return [
    // Secret key (sk_test_xxx)
    'secret' => env('STRIPE_SECRET', ''),

    // Publishable key (pk_test_xxx) - mostly for front end if you ever add card elements
    'public' => env('STRIPE_PUBLIC', ''),

    // Webhook signing secret (whsec_xxx)
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),

    // Price IDs for each paid plan (set in .env)
    'price_host' => env('STRIPE_PRICE_HOST', ''), // $19/mo — Host plan
    'price_pro'  => env('STRIPE_PRICE_PRO', ''),  // $49/mo — Pro plan

    // Legacy alias (kept for backwards compat during migration)
    'price_id' => env('STRIPE_PRICE_HOST', ''),

    // Optional override URLs (you actually don't need these because you're already using route())
    'success_url' => env('STRIPE_SUCCESS_URL', ''),
    'cancel_url'  => env('STRIPE_CANCEL_URL', ''),
];
