<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use App\Http\Resources\RentBillResource;
use App\Http\Requests\Landlord\WaiveBillRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordRentBillController extends Controller
{
    /**
     * List all rent bills for the landlord.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        
        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->with(['tenancy.tenant', 'tenancy.unit.property'])
            ->orderBy('billing_month', 'desc');

        $status = $request->get('status');
        if ($status && $status !== 'all') {
            $query->where('rent_bills.status', $status);
        }

        $rentBills = $query->paginate(15);

        // Get overall stats (Global)
        $statsQuery = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        });

        $totalCount = (clone $statsQuery)->count();
        $pendingCount = (clone $statsQuery)->where('rent_bills.status', 'pending')->count();
        $overdueCount = (clone $statsQuery)->where(function ($q) {
            $q->where('rent_bills.status', 'overdue')
              ->orWhere(function ($q2) {
                  $q2->whereIn('rent_bills.status', ['pending', 'partial'])
                     ->where('rent_bills.due_date', '<', now()->toDateString());
              });
        })->count();
        $paidCount = (clone $statsQuery)->where('rent_bills.status', 'paid')->count();

        return Inertia::render('landlord/rent-bills/index', [
            'rentBills' => RentBillResource::collection($rentBills),
            'stats' => [
                'total' => $totalCount,
                'pending' => $pendingCount,
                'overdue' => $overdueCount,
                'paid' => $paidCount,
            ],
            'filters' => [
                'status' => $status,
                'search' => $request->get('search'),
            ],
        ]);
    }

    /**
     * Show a single rent bill.
     */
    public function show(Request $request, RentBill $rentBill)
    {
        $this->authorize('view', $rentBill);
 
        $rentBill->load([
                'tenancy.tenant',
                'tenancy.unit.property',
                'payments',
            ]);

        return Inertia::render('landlord/rent-bills/show', [
            'rentBill' => new RentBillResource($rentBill),
        ]);
    }

    /**
     * Waive a rent bill.
     */
    public function waive(WaiveBillRequest $request, RentBill $rentBill)
    {
        $this->authorize('waive', $rentBill);
 
        if (in_array($rentBill->status, ['waived', 'paid'])) {
            return redirect()
                ->back()
                ->with('error', "Cannot waive a rent bill that is already {$rentBill->status}.");
        }
 
        $validated = $request->validated();
 
        app(\App\Services\RentBillService::class)->waiveRentBill($rentBill, $validated['notes'] ?? null);

        return redirect()
            ->route('landlord.rent-bills.show', ['rentBill' => $rentBill->id])
            ->with('success', 'Rent bill waived successfully.');
    }
}
