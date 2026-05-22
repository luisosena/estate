<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Tenant\TenantProfileUpdateRequest;
use App\Http\Requests\Api\UserProfileUpdateRequest;
use App\Models\SecurityEvent;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $user = request()->user();

        if ($user->role !== Role::Tenant) {
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

    public function update(UserProfileUpdateRequest $request, TenantProfileUpdateRequest $tenantProfileRequest): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== Role::Tenant) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->forceFill($request->validated())->save();

        if ($user->tenant) {
            $tenantValidated = $tenantProfileRequest->validated();

            $user->tenant->update($tenantValidated);
            $user->load('tenant');
        }

        SecurityEvent::log(
            userId: $request->user()->id,
            eventType: SecurityEvent::EVENT_PROFILE_UPDATED,
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            severity: SecurityEvent::SEVERITY_LOW,
        );

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
