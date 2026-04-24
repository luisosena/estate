<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UserProfileUpdateRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * GET /api/tenant/profile - Get current tenant profile
     */
    public function show(): JsonResponse
    {
        $user = request()->user();

        if ($user->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->loadMissing('tenant');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'tenant' => $user->tenant,
            ],
        ]);
    }

    /**
     * PUT /api/tenant/profile - Update tenant profile
     */
    public function update(UserProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->forceFill($request->validated())->save();

        if ($user->tenant) {
            $tenantValidated = $request->validate([
                'full_name' => ['sometimes', 'string', 'max:255'],
                'phone' => ['sometimes', 'string', 'max:20'],
                'email' => ['sometimes', 'email'],
                'emergency_contact_name' => ['sometimes', 'string', 'max:255'],
                'emergency_contact_phone' => ['sometimes', 'string', 'max:20'],
                'emergency_contact_relation' => ['sometimes', 'string', 'max:100'],
            ]);

            $user->tenant->update($tenantValidated);
            $user->load('tenant');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'tenant' => $user->tenant,
            ],
        ]);
    }
}
