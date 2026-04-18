<?php

namespace App\Services\Admin;

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;

class AdminLandlordService
{
    /**
     * Get landlord listing with statistics and filters.
     */
    public function getLandlordList(Request $request): array
    {
        $query = User::where('role', 'landlord');

        // Search functionality
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('username', 'like', '%'.$request->search.'%');
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
            'total_properties' => Property::count(),
        ];

        return [
            'landlords' => $landlords,
            'stats' => $stats,
        ];
    }
}
