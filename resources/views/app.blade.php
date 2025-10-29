<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    {{-- Primary SEO meta --}}
    <title inertia>{{ config('app.name', 'Welcome Pack') }}</title>
    <meta name="description" content="Your digital Airbnb welcome book: Wi-Fi, check-in steps, house rules, local tips, and emergency info in one clean QR-accessible page for every stay." />

    {{-- Favicons / icons --}}
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />

    {{-- Apple / iOS --}}
    <link rel="apple-touch-icon" href="/icons/ios-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Welcome Pack" />

    {{-- PWA manifest / theme --}}
    <meta name="theme-color" content="#111827" />
    <link rel="manifest" href="/manifest.webmanifest" />

    {{-- Security --}}
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    {{-- Inertia head injection (MUST stay before Vite includes in your setup) --}}
    @inertiaHead

    {{-- Scripts --}}
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>
