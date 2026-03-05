<?php

namespace App\Http\Controllers\Api\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $rawToken = bin2hex(random_bytes(32));
        $rawRefreshToken = bin2hex(random_bytes(32));

        ApiToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $rawToken),
            'refresh_token_hash' => hash('sha256', $rawRefreshToken),
            'expires_at' => now()->addHours(8),
            'refresh_expires_at' => now()->addDays(30),
            'last_used_at' => now(),
        ]);

        $user->forceFill(['last_login_at' => now()])->save();

        $user->loadMissing('tenant');

        return response()->json([
            'token' => $rawToken,
            'refresh_token' => $rawRefreshToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant' => $user->tenant ? [
                    'id' => $user->tenant->id,
                    'full_name' => $user->tenant->full_name,
                    'phone' => $user->tenant->phone,
                    'email' => $user->tenant->email,
                ] : null,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $raw = $request->bearerToken();
        if ($raw) {
            ApiToken::query()
                ->where('token_hash', hash('sha256', $raw))
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);
        }

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->loadMissing('tenant');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'tenant' => $user->tenant ? [
                'id' => $user->tenant->id,
                'full_name' => $user->tenant->full_name,
                'phone' => $user->tenant->phone,
                'email' => $user->tenant->email,
            ] : null,
        ]);
    }

    public function refresh(Request $request)
    {
        $validated = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $refreshHash = hash('sha256', $validated['refresh_token']);

        $apiToken = ApiToken::query()
            ->where('refresh_token_hash', $refreshHash)
            ->whereNull('revoked_at')
            ->whereNotNull('refresh_expires_at')
            ->where('refresh_expires_at', '>', now())
            ->first();

        if (! $apiToken) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $rawToken = bin2hex(random_bytes(32));

        $apiToken->forceFill([
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => now()->addHours(8),
            'last_used_at' => now(),
        ])->save();

        return response()->json([
            'token' => $rawToken,
        ]);
    }
}
