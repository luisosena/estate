<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\User;

class AdminUserController extends Controller
{
    /**
     * Display a listing of landlords.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->role !== 'admin') {
                return redirect()->route('login')->with('error', 'Access denied. Admin role required.');
            }
        } catch (\Exception $e) {
            \Log::error('Admin users index error: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        $query = User::where('role', 'landlord');

        // Search functionality
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('username', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        $landlords = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get statistics
        $stats = [
            'total_landlords' => User::where('role', 'landlord')->count(),
            'active_landlords' => User::where('role', 'landlord')->whereNotNull('email_verified_at')->count(),
            'inactive_landlords' => User::where('role', 'landlord')->whereNull('email_verified_at')->count(),
            'total_properties' => User::where('role', 'landlord')->withCount('properties')->get()->sum('properties_count'),
        ];

        return Inertia::render('admin/users/index', [
            'landlords' => $landlords,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new landlord.
     */
    public function create()
    {
        try {
            $user = request()->user();

            if (!$user || $user->role !== 'admin') {
                return redirect()->route('login')->with('error', 'Access denied. Admin role required.');
            }
        } catch (\Exception $e) {
            \Log::error('Admin users create error: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        return Inertia::render('admin/users/create');
    }

    /**
     * Store a newly created landlord.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'send_welcome_email' => 'boolean',
        ]);

        // Create the landlord user
        $landlord = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'landlord',
            'email_verified_at' => now(), // Auto-verify for admin-created accounts
        ]);

        // TODO: Send welcome email if requested
        if ($validated['send_welcome_email']) {
            // Implement welcome email logic here
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Landlord created successfully.');
    }

    /**
     * Display the specified landlord.
     */
    public function show(User $landlord)
    {
        if ($landlord->role !== 'landlord') {
            return redirect()->route('admin.users.index')->with('error', 'User is not a landlord.');
        }

        $landlord->load(['properties', 'properties.units']);

        // Get landlord statistics
        $stats = [
            'total_properties' => $landlord->properties->count(),
            'total_units' => $landlord->properties->sum('total_units'),
            'occupied_units' => $landlord->properties()
                ->join('units', 'properties.id', '=', 'units.property_id')
                ->where('units.status', 'occupied')->count(),
            'active_tenancies' => $landlord->properties()
                ->join('units', 'properties.id', '=', 'units.property_id')
                ->join('tenancies', 'units.id', '=', 'tenancies.unit_id')
                ->where('tenancies.status', 'active')->count(),
        ];

        return Inertia::render('admin/users/show', [
            'landlord' => $landlord,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified landlord.
     */
    public function edit(User $landlord)
    {
        if ($landlord->role !== 'landlord') {
            return redirect()->route('admin.users.index')->with('error', 'User is not a landlord.');
        }

        return Inertia::render('admin/users/edit', [
            'landlord' => $landlord,
        ]);
    }

    /**
     * Update the specified landlord.
     */
    public function update(Request $request, User $landlord)
    {
        if ($landlord->role !== 'landlord') {
            return redirect()->route('admin.users.index')->with('error', 'User is not a landlord.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $landlord->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $landlord->id,
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update user basic info
        $landlord->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
        ]);

        // Update password if provided
        if (!empty($validated['password'])) {
            $landlord->password = Hash::make($validated['password']);
            $landlord->save();
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Landlord updated successfully.');
    }

    /**
     * Remove the specified landlord.
     */
    public function destroy(User $landlord)
    {
        if ($landlord->role !== 'landlord') {
            return redirect()->route('admin.users.index')->with('error', 'User is not a landlord.');
        }

        // Check if landlord has properties
        if ($landlord->properties()->exists()) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Cannot delete landlord with existing properties.');
        }

        $landlord->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Landlord deleted successfully.');
    }

    /**
     * Toggle landlord status (activate/deactivate).
     */
    public function toggleStatus(User $landlord)
    {
        if ($landlord->role !== 'landlord') {
            return redirect()->route('admin.users.index')->with('error', 'User is not a landlord.');
        }

        if ($landlord->email_verified_at) {
            $landlord->email_verified_at = null;
            $message = 'Landlord deactivated successfully.';
        } else {
            $landlord->email_verified_at = now();
            $message = 'Landlord activated successfully.';
        }

        $landlord->save();

        return redirect()
            ->route('admin.users.index')
            ->with('success', $message);
    }
}
