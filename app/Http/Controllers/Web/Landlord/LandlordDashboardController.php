<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\RentBill;
use App\Http\Resources\PropertyResource;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units', 'tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum('active_tenants_count');

        // ...

        // Calculate monthly revenue from active tenancies
        $monthlyRevenue = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->where('tenancies.status', 'active')
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
                SUM(CASE WHEN rent_bills.status = \'pending\' AND (rent_bills.due_date >= CURDATE() OR rent_bills.due_date IS NULL) THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN rent_bills.status = \'overdue\' OR (rent_bills.status IN (\'pending\', \'partial\') AND rent_bills.due_date < CURDATE()) THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN rent_bills.status IN (\'pending\', \'partial\', \'overdue\') THEN rent_bills.amount_due - rent_bills.amount_paid ELSE 0 END) as total_outstanding
            ')
            ->first();

        $pendingRentBills = (int) ($rentStats->pending_count ?? 0);
        $overdueRentBills = (int) ($rentStats->overdue_count ?? 0);
        $totalRentOutstanding = (float) ($rentStats->total_outstanding ?? 0);

        return Inertia::render('landlord/dashboard', [
            'properties' => PropertyResource::collection($properties),
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