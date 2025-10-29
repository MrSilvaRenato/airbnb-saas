<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureTenant
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        abort_if(!$user || $user->role !== 'tenant', 403);
        return $next($request);
    }
}
