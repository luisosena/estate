<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        // Allow requests already authenticated via the Sanctum guard (e.g. in tests).
        if (Auth::guard('sanctum')->check()) {
            Auth::setUser(Auth::guard('sanctum')->user());

            return $next($request);
        }

        $raw = $request->bearerToken();

        if (! $raw) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tokenHash = hash('sha256', $raw);

        $apiToken = ApiToken::query()
            ->where('token_hash', $tokenHash)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->with('user')
            ->first();

        if (! $apiToken || ! $apiToken->user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $apiToken->forceFill(['last_used_at' => now()])->save();

        Auth::setUser($apiToken->user);

        $request->setUserResolver(function () use ($apiToken) {
            return $apiToken->user;
        });

        return $next($request);
    }
}
