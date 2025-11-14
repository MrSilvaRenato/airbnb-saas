<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // Send unauthenticated users to login (or 'landing' if you prefer)
        return $request->expectsJson() ? null : route('landing'); // or route('landing')
    }
}
