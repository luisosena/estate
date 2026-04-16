<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Resources\LandlordResource;

class AdminLandlordController extends Controller
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
            \Log::error('Admin landlords index error: ' . $e->getMessage());
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

        $landlords = $query->withCount('properties')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Get statistics (Global)
        $stats = [
            'total_landlords' => User::where('role', 'landlord')->count(),
            'active_landlords' => User::where('role', 'landlord')->whereNotNull('email_verified_at')->count(),
            'inactive_landlords' => User::where('role', 'landlord')->whereNull('email_verified_at')->count(),
            'total_properties' => \App\Models\Property::count(),
        ];

        return Inertia::render('admin/landlords/index', [
            'landlords' => LandlordResource::collection($landlords),
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }
}
