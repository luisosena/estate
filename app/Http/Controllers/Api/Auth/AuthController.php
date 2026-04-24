<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request, CreateNewUser $creator)
    {
        $user = $creator->create($request->all());

        // Log the registration event if needed
        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken($request->input('device_name', 'mobile-app'))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'tenant' => null, // New users don't have tenant records yet
            ],
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('username', $validated['username'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken($request->input('device_name', 'mobile-app'))->plainTextToken;

        $user->forceFill(['last_login_at' => now()])->save();

        $user->loadMissing('tenant');

        return response()->json([
            'token' => $token,
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
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()->delete();

            // Clear current authentication state for both guards to ensure test stability and session isolation
            if (method_exists(auth()->guard('sanctum'), 'forgetUser')) {
                auth()->guard('sanctum')->forgetUser();
            }
            Auth::guard('web')->logout();
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
            'data' => [
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
}
