<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * GET /api/users - List all users (paginated)
     * Role required: admin, landlord
     */
    public function index(Request $request): JsonResponse
    {
        // Verify user has admin or landlord role
        if (! in_array($request->user()->role, [Role::Admin, Role::Landlord])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

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
        if (! in_array($request->user()->role, [Role::Admin, Role::Landlord])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::with('tenant')->find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Landlords can only view their own account or tenants in their properties
        if ($request->user()->role === Role::Landlord) {
            $isOwner = $request->user()->id === $id;

            // Eager load relationships to prevent N+1 query issue
            $user->loadMissing('tenant.tenancies.unit.property');

            $isTenantInProperty = $user->tenant && $user->tenant->tenancies->contains(function ($tenancy) use ($request) {
                return $tenancy->unit &&
                       $tenancy->unit->property &&
                       $tenancy->unit->property->owner_id === $request->user()->id;
            });

            if (! $isOwner && ! $isTenantInProperty) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        return response()->json(['user' => $user]);
    }

    /**
     * POST /api/users - Create new user
     * Role required: admin only (landlords can only create tenant users)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only admin can create admins; landlords can only create tenants
        if ($user->role === Role::Landlord) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['required', Rule::in(['tenant'])], // Landlords can only create tenants
                'phone' => ['nullable', 'string', 'max:20'],
            ]);
        } elseif ($user->role !== Role::Admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        } else {
            // Admin can create any role
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['required', Rule::in(['tenant', 'landlord', 'admin'])],
                'phone' => ['nullable', 'string', 'max:20'],
            ]);
        }

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
    public function update(Request $request, int $id): JsonResponse
    {
        // Users can only update their own profile unless admin
        if ($request->user()->role !== Role::Admin && $request->user()->id !== $id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$id],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', Rule::in(['tenant', 'landlord', 'admin'])],
        ]);

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
     * DELETE /api/users/{id} - Delete user
     * Role required: admin only
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user()->role !== Role::Admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

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
