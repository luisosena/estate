<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use Illuminate\Http\Request;

class LandlordRentBillController extends Controller
{
    /**
     * List all rent bills for the landlord.
     * GET /landlord/rent-bills
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        
        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->with(['tenancy.tenant', 'tenancy.unit', 'tenancy.unit.property'])
            ->orderBy('billing_month', 'desc');

        $status = $request->get('status');
        if ($status) {
            $query->where('status', $status);
        }

        $rentBills = $query->paginate(15);

        // Get overall stats (not filtered by status)
        $statsQuery = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        });

        $totalCount = (clone $statsQuery)->count();
        $pendingCount = (clone $statsQuery)->where('status', 'pending')->count();
        $overdueCount = (clone $statsQuery)->where(function ($q) {
            $q->where('status', 'overdue')
              ->orWhere(function ($q2) {
                  $q2->whereIn('status', ['pending', 'partial'])
                     ->where('due_date', '<', now()->toDateString());
              });
        })->count();
        $paidCount = (clone $statsQuery)->where('status', 'paid')->count();

        return inertia('Landlord/RentBills/Index', [
            'rentBills' => $rentBills,
            'stats' => [
                'total' => $totalCount,
                'pending' => $pendingCount,
                'overdue' => $overdueCount,
                'paid' => $paidCount,
            ],
        ]);
    }

    /**
     * Show a single rent bill.
     * GET /landlord/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $landlord = $request->user();

        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->with([
                'tenancy.tenant',
                'tenancy.unit',
                'tenancy.unit.property',
                'payments',
            ])
            ->findOrFail($id);

        return inertia('Landlord/RentBills/Show', [
            'rentBill' => $rentBill,
        ]);
    }

    /**
     * Waive a rent bill.
     * POST /landlord/rent-bills/{id}/waive
     */
    public function waive(Request $request, int $id)
    {
        $landlord = $request->user();

        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->findOrFail($id);

        // Check if already waived or paid
        if (in_array($rentBill->status, ['waived', 'paid'])) {
            return redirect()
                ->back()
                ->with('error', "Cannot waive a rent bill that is already {$rentBill->status}.");
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        app(\App\Services\RentBillService::class)->waiveRentBill($rentBill, $validated['notes'] ?? null);

        return redirect()
            ->route('landlord.rent-bills.show', ['rentBill' => $rentBill->id])
            ->with('success', 'Rent bill waived successfully.');
    }
}
