<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Exempt the engagement beacon from CSRF — it's fired via fetch/sendBeacon
        // from the public guest page where attaching a token is unreliable.
        $middleware->validateCsrfTokens(except: [
            'engagement/track',
            'stripe/webhook',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
            'auth'   => \App\Http\Middleware\Authenticate::class,
            'host'   => \App\Http\Middleware\EnsureHost::class,
            'tenant' => \App\Http\Middleware\EnsureTenant::class,
            'role'   => \App\Http\Middleware\Role::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
