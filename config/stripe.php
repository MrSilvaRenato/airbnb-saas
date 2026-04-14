<?php

return [
    // Secret key (sk_test_xxx)
    'secret' => env('STRIPE_SECRET', ''),

    // Publishable key (pk_test_xxx) - mostly for front end if you ever add card elements
    'public' => env('STRIPE_PUBLIC', ''),

    // Webhook signing secret (whsec_xxx)
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),

    // Price IDs for each paid plan (set in .env)
    'price_growth' => env('STRIPE_PRICE_GROWTH', ''), // $29/mo — Growth plan
    'price_pro'    => env('STRIPE_PRICE_PRO', ''),    // $79/mo — Pro plan
    'price_agency' => env('STRIPE_PRICE_AGENCY', ''), // $199/mo — Agency plan (future)

    // Legacy aliases (backwards compat — old host price maps to growth)
    'price_host' => env('STRIPE_PRICE_GROWTH', env('STRIPE_PRICE_HOST', '')),
    'price_id'   => env('STRIPE_PRICE_GROWTH', env('STRIPE_PRICE_HOST', '')),

    // Optional override URLs (you actually don't need these because you're already using route())
    'success_url' => env('STRIPE_SUCCESS_URL', ''),
    'cancel_url'  => env('STRIPE_CANCEL_URL', ''),
];
