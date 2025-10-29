<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Role
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->user();
        if (!$user) abort(403);
        if ($role === 'host' && !$user->isHost()) abort(403);
        if ($role === 'tenant' && !$user->isTenant()) abort(403);
        return $next($request);
    }
}
