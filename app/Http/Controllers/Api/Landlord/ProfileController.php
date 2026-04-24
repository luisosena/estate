<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UserProfileUpdateRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * GET /api/landlord/profile - Get current landlord profile
     */
    public function show(): JsonResponse
    {
        $user = request()->user();

        if ($user->role !== 'landlord') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * PUT /api/landlord/profile - Update landlord profile
     */
    public function update(UserProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'landlord') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->forceFill($request->validated())->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }
}
