<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Payment;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get landlord dashboard data.
     * GET /api/v1/landlord/dashboard
     */
    public function index(Request $request)
    {
        try {
            $landlord = $request->user();

            // Get all properties owned by this landlord
            $properties = Property::where('owner_id', $landlord->id)
                ->withCount(['units'])
                ->with(['tenancies' => function ($query) {
                    $query->where('tenancies.status', '=', 'active');
                }])
                ->with(['units', 'units.tenancies'])
                ->get();

            // Calculate summary statistics
            $totalProperties = $properties->count();
            $totalUnits = $properties->sum('units_count');
            $totalActiveTenants = $properties->sum(function ($property) {
                return $property->tenancies->count();
            });

            // Calculate occupied and vacant units
            $allUnits = $properties->flatMap(function ($property) {
                return $property->units;
            });
            $occupiedUnits = $allUnits->filter(function ($unit) {
                return $unit->tenancies->where('status', 'active')->isNotEmpty();
            })->count();
            $vacantUnits = $totalUnits - $occupiedUnits;

            // Get pending payments count (using 'overdue' as the pending/unpaid status)
            $pendingPayments = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                    $query->where('owner_id', $landlord->id);
                })
                ->where('status', 'pending')
                ->count();

            // Get overdue payments count (separate from pending)
            $overduePayments = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                    $query->where('owner_id', $landlord->id);
                })
                ->where('status', 'overdue')
                ->count();

            // Get recent payments with tenant and unit info
            $recentPayments = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                    $query->where('owner_id', $landlord->id);
                })
                ->with(['tenant:id,full_name,tenant_code', 'tenancy:id,unit_id'])
                ->with('tenancy.unit:id,unit_name,property_id')
                ->orderBy('paid_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    // Calculate due date as 1st of next month (typical rent billing cycle)
                    $dueDate = Carbon::now()->addMonth()->startOfMonth()->format('Y-m-d');

                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_type' => $payment->payment_type,
                        'status' => $payment->status,
                        'paid_at' => $payment->paid_at,
                        'due_date' => $dueDate,
                        'tenant_name' => $payment->tenant?->full_name,
                        'unit_number' => $payment->tenancy?->unit?->unit_name,
                        'tenant' => $payment->tenant ? [
                            'id' => $payment->tenant->id,
                            'full_name' => $payment->tenant->full_name,
                            'tenant_code' => $payment->tenant->tenant_code,
                        ] : null,
                    ];
                });

            // Get expiring leases (tenancies ending within 30 days)
            $thirtyDaysFromNow = Carbon::now()->addDays(30);
            $expiringLeases = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
                    $query->where('owner_id', $landlord->id);
                })
                ->where('status', 'active')
                ->whereNotNull('move_out_date')
                ->where('move_out_date', '<=', $thirtyDaysFromNow)
                ->with(['tenant:id,full_name,email', 'unit:id,unit_name,property_id'])
                ->orderBy('move_out_date', 'asc')
                ->take(5)
                ->get()
                ->map(function ($tenancy) {
                    return [
                        'id' => $tenancy->id,
                        'status' => $tenancy->status,
                        'move_in_date' => $tenancy->move_in_date,
                        'move_out_date' => $tenancy->move_out_date,
                        'rent_amount' => $tenancy->monthly_rent,
                        'tenant' => $tenancy->tenant ? [
                            'id' => $tenancy->tenant->id,
                            'full_name' => $tenancy->tenant->full_name,
                            'email' => $tenancy->tenant->email,
                        ] : null,
                        'unit' => $tenancy->unit ? [
                            'id' => $tenancy->unit->id,
                            'unit_number' => $tenancy->unit->unit_name,
                        ] : null,
                    ];
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

            // Get unread notifications count
            $unreadNotificationsCount = $landlord->unreadNotifications()->count();

            return response()->json([
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'vacant_units' => $vacantUnits,
                'total_tenants' => $totalActiveTenants,
                'pending_payments' => $pendingPayments,
                'overdue_payments' => $overduePayments,
                'recent_payments' => $recentPayments,
                'expiring_leases' => $expiringLeases,
                'properties' => $formattedProperties,
                'unread_notifications' => $unreadNotificationsCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching dashboard data',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}
