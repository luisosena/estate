<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterPushTokenRequest;
use App\Http\Requests\Api\UserProfileUpdateRequest;
use App\Http\Requests\Api\UserStoreRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/users - List all users (paginated)
     * Role required: admin, landlord
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query()->with('tenant');

        // Landlords can only see their own account and tenants in their properties
        if ($request->user()->role === Role::Landlord) {
            $landlordId = $request->user()->id;
            $query->where(function ($q) use ($landlordId) {
                $q->where('id', $landlordId)
                    ->orWhereHas('tenant.tenancies.unit.property', function ($propertyQuery) use ($landlordId) {
                        $propertyQuery->where('owner_id', $landlordId);
                    });
            });
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Paginate results
        $perPage = $request->input('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * GET /api/users/{id} - Show user details
     * Role required: admin, landlord
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = User::with('tenant')->findOrFail($id);
        $this->authorize('view', $user);

        return response()->json(['user' => $user]);
    }

    /**
     * POST /api/users - Create new user
     * Role required: admin only (landlords can only create tenant users)
     */
    public function store(UserStoreRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Hash the password
            'role' => $validated['role'],
        ]);

        if (! empty($validated['phone'])) {
            $user->phone = $validated['phone'];
            $user->save();
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('tenant'),
        ], 201);
    }

    /**
     * PUT /api/users/{id} - Update user
     * Users can only update their own profile unless admin
     */
    public function update(UserProfileUpdateRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $validated = $request->validated();

        // Non-admin users cannot change their own role
        if ($request->user()->role !== Role::Admin) {
            unset($validated['role']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('tenant'),
        ]);
    }

    /**
     * POST /api/v1/users/push-token - Register device push token
     */
    public function registerPushToken(RegisterPushTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = $request->user();
        $updateData = [
            'expo_push_token' => $validated['token'],
            'expo_push_token_updated_at' => now(),
        ];

        if (! empty($validated['platform'])) {
            $updateData['push_platform'] = $validated['platform'];
        }

        $user->update($updateData);

        return response()->json(['message' => 'Push token registered']);
    }

    /**
     * DELETE /api/v1/users/push-token - Remove device push token
     */
    public function removePushToken(Request $request): JsonResponse
    {
        $request->user()->update([
            'expo_push_token' => null,
            'expo_push_token_updated_at' => null,
        ]);

        return response()->json(['message' => 'Push token removed']);
    }

    /**
     * DELETE /api/users/{id} - Delete user
     * Role required: admin only
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('delete', $user);

        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
