<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Unit;
use App\Models\Tenancy;
use App\Models\User;
use App\Http\Resources\LandlordResource;
use App\Http\Resources\PropertyResource;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->role !== 'admin') {
                return redirect()->route('login')->with('error', 'Access denied. Admin role required.');
            }
        } catch (\Exception $e) {
            \Log::error('Admin dashboard error: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        // Global Statistics
        $stats = [
            'total_properties' => Property::count(),
            'total_units' => Unit::count(),
            'active_tenancies' => Tenancy::where('tenancies.status', 'active')->count(),
            'total_landlords' => User::where('role', 'landlord')->count(),
            'pending_landlords' => User::where('role', 'landlord')->whereNull('users.email_verified_at')->count(),
            'maintenance_properties' => Property::where('properties.status', 'maintenance')->count(),
        ];

        // Recent Activity Synthesis
        $recentLandlords = User::where('role', 'landlord')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($landlord) {
                $resource = new LandlordResource($landlord);
                return [
                    'id' => $landlord->id,
                    'type' => 'landlord_registration',
                    'title' => 'New Landlord Registered',
                    'description' => $landlord->name . " joined the platform.",
                    'time' => $landlord->created_at->diffForHumans(),
                    'icon' => 'users',
                    'payload' => $resource->resolve(),
                ];
            });

        $recentProperties = Property::with('landlord')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($property) {
                $resource = new PropertyResource($property);
                return [
                    'id' => $property->id,
                    'type' => 'property_registration',
                    'title' => 'Property Added',
                    'description' => $property->name . " was registered by " . ($property->landlord->name ?? 'Unknown') . ".",
                    'time' => $property->created_at->diffForHumans(),
                    'icon' => 'building',
                    'payload' => $resource->resolve(),
                ];
            });

        $activity = $recentLandlords->concat($recentProperties)
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'activity' => $activity
        ]);
    }

    /**
     * Display the admin's notifications (placeholder).
     */
    public function notifications(Request $request)
    {
        return Inertia::render('admin/notifications/index', [
            'notifications' => [
                'data' => [],
                'total' => 0
            ],
            'unreadCount' => 0
        ]);
    }
}