<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DemoSessionTimeout
{
    public const TIMEOUT_MINUTES = 30;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_demo) {
            return $next($request);
        }

        $startedAt = $request->session()->get('demo_started_at');

        if (! $startedAt) {
            $request->session()->put('demo_started_at', now());

            return $next($request);
        }

        $startedAtCarbon = Carbon::parse($startedAt);

        if ($startedAtCarbon->addMinutes(self::TIMEOUT_MINUTES)->isPast()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('home')->with(
                'error',
                'Your demo session has expired. Sign up to continue exploring!'
            );
        }

        return $next($request);
    }
}
