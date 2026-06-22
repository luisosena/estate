<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotDemoUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_demo) {
            return $next($request);
        }

        if ($request->is('settings*')) {
            return back()->with('error', 'Settings is not available in demo mode.');
        }

        if ($request->isMethod('GET') || $request->isMethod('HEAD')) {
            return $next($request);
        }

        if ($request->is('logout')) {
            return $next($request);
        }

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'message' => 'This action is disabled in demo mode.',
            ], 403);
        }

        return back()->with('error', 'This action is disabled in demo mode.');
    }
}
