<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Payment;

class DashboardController extends Controller
{
    /**
     * Get landlord dashboard data.
     * GET /api/v1/landlord/dashboard
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->get();

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum(function ($property) {
            return $property->tenancies->count();
        });

        // Format properties for frontend
        $formattedProperties = $properties->map(function ($property) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'units_count' => $property->units_count,
                'active_tenants_count' => $property->tenancies->count(),
            ];
        });

        // Calculate monthly revenue from active tenancies
        $monthlyRevenue = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->where('status', 'active')
            ->sum('monthly_rent');

        // Get recent payments
        $recentPayments = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->with(['tenant:id,full_name,tenant_code', 'tenancy:id'])
            ->orderBy('paid_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_type' => $payment->payment_type,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'tenant' => $payment->tenant ? [
                        'id' => $payment->tenant->id,
                        'full_name' => $payment->tenant->full_name,
                        'tenant_code' => $payment->tenant->tenant_code,
                    ] : null,
                ];
            });

        // Get unread notifications count
        $unreadNotificationsCount = $landlord->unreadNotifications()->count();

        return response()->json([
            'properties' => $formattedProperties,
            'recent_payments' => $recentPayments,
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => $monthlyRevenue,
                'unread_notifications' => $unreadNotificationsCount,
            ],
        ]);
    }
}
