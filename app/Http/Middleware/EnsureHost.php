<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureHost
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        abort_if(!$user || !in_array($user->role, ['host','admin']), 403);
        return $next($request);
    }
}
