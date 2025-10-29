<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // Send guests to the Welcome page instead of /login
        return $request->expectsJson() ? null : route('welcome');
    }
}
