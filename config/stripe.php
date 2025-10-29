<?php

return [
    'secret'         => env('STRIPE_SECRET'),
    'public'         => env('STRIPE_PUBLIC'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    'price_pro'      => env('STRIPE_PRICE_PRO'),
    'success_url'    => env('STRIPE_SUCCESS_URL'),
    'cancel_url'     => env('STRIPE_CANCEL_URL'),
];
