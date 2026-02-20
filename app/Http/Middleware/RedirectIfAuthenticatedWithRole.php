<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\RoleRedirects;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticatedWithRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        // Skip middleware for logout route
        if ($request->is('logout') || $request->routeIs('logout')) {
            return $next($request);
        }

        // Allow POST login requests (form submissions) to proceed
        if ($request->isMethod('post') && $request->is('login')) {
            return $next($request);
        }

        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = $request->user();
                
                $redirectUrl = RoleRedirects::urlByRole($user->role);
                
                return redirect($redirectUrl);
            }
        }

        return $next($request);
    }
}
