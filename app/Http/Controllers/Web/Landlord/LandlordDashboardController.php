<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\RentBill;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit and tenancy counts
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

        // Get unread notifications count
        $unreadNotificationsCount = $landlord->unreadNotifications()->count();

        // Get rent bill statistics
        // pending_count: bills that are truly pending (not yet overdue)
        // overdue_count: bills that are overdue (status='overdue' OR status IN ('pending','partial') with due_date < today)
        $rentStats = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->selectRaw('
                SUM(CASE WHEN status = \'pending\' AND (due_date >= CURDATE() OR due_date IS NULL) THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = \'overdue\' OR (status IN (\'pending\', \'partial\') AND due_date < CURDATE()) THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status IN (\'pending\', \'partial\', \'overdue\') THEN amount_due - amount_paid ELSE 0 END) as total_outstanding
            ')
            ->first();

        $pendingRentBills = (int) ($rentStats->pending_count ?? 0);
        $overdueRentBills = (int) ($rentStats->overdue_count ?? 0);
        $totalRentOutstanding = (float) ($rentStats->total_outstanding ?? 0);

        return Inertia::render('landlord/dashboard', [
            'properties' => $formattedProperties,
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => $monthlyRevenue,
                'pending_rent_bills' => $pendingRentBills,
                'overdue_rent_bills' => $overdueRentBills,
                'total_rent_outstanding' => $totalRentOutstanding,
            ],
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ]);
    }

}