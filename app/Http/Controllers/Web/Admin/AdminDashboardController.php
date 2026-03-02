<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Unit;
use App\Models\Tenancy;

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

        // Fetch statistics
        $stats = [
            'total_properties' => Property::count(),
            'total_units' => Unit::count(),
            'active_tenancies' => Tenancy::where('status', 'active')->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats
        ]);
    }
}