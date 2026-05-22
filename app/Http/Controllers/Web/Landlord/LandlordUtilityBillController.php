<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Enums\BillStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\WaiveBillRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\UtilityBillResource;
use App\Models\Property;
use App\Models\UtilityBill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LandlordUtilityBillController extends Controller
{
    /**
     * Display a listing of all utility bills.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        $query = UtilityBill::whereHas('tenancyUtility.tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with([
                'tenancyUtility.utilityType',
                'tenancyUtility.tenancy.unit.property',
                'tenancyUtility.tenancy.tenant',
                'tenancyUtility.bills',
            ]);

        // Apply filters
        if ($request->has('status') && $request->status) {
            $query->where('utility_bills.status', $request->status);
        }

        if ($request->has('property_id') && $request->property_id) {
            $query->whereHas('tenancyUtility.tenancy.unit', function ($q) use ($request) {
                $q->where('property_id', $request->property_id);
            });
        }

        $bills = $query->orderBy('billing_month', 'desc')
            ->orderBy('due_date', 'asc')
            ->paginate(15);

        // Get properties for filter
        $properties = Property::where('owner_id', $landlord->id)
            ->orderBy('name')
            ->get();

        // Calculate summary stats
        $summaryQuery = UtilityBill::whereHas('tenancyUtility.tenancy.unit.property', function ($q) use ($landlord) {
            $q->where('owner_id', $landlord->id);
        });

        $summary = $summaryQuery->selectRaw(
            "SUM(CASE WHEN utility_bills.status = 'pending' THEN utility_bills.amount_due ELSE 0 END) as total_pending,
             SUM(CASE WHEN utility_bills.status = 'overdue' THEN utility_bills.amount_due ELSE 0 END) as total_overdue,
             SUM(CASE WHEN utility_bills.status = 'partial' THEN utility_bills.amount_due ELSE 0 END) as total_partial"
        )->first();

        return Inertia::render('landlord/utility-bills/index', [
            'bills' => UtilityBillResource::collection($bills),
            'properties' => PropertyResource::collection($properties),
            'filters' => [
                'status' => $request->status ?? '',
                'property_id' => $request->property_id ?? '',
            ],
            'summary' => [
                'total_pending' => $summary->total_pending ?? 0,
                'total_overdue' => $summary->total_overdue ?? 0,
                'total_partial' => $summary->total_partial ?? 0,
            ],
        ]);
    }

    /**
     * Display utility bill details.
     */
    public function show(Request $request, UtilityBill $utilityBill)
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill
        $this->authorize('view', $utilityBill);

        $utilityBill->load([
            'tenancyUtility.utilityType',
            'tenancyUtility.tenancy.unit.property',
            'tenancyUtility.tenancy.tenant',
            'tenancyUtility.bills',
            'payments',
        ]);

        return Inertia::render('landlord/utility-bills/show', [
            'bill' => new UtilityBillResource($utilityBill),
        ]);
    }

    /**
     * Waive a utility bill.
     */
    public function waive(WaiveBillRequest $request, UtilityBill $utilityBill)
    {
        $this->authorize('waive', $utilityBill);

        try {
            if (in_array($utilityBill->status, [BillStatus::Paid, BillStatus::Waived])) {
                return redirect()
                    ->back()
                    ->with('error', 'This bill cannot be waived as it is already '.$utilityBill->status->value);
            }

            $validated = $request->validated();
            $notes = $validated['notes'] ?? 'Waived by landlord';

            $utilityBill->update([
                'status' => BillStatus::Waived,
                'notes' => ($utilityBill->notes ? $utilityBill->notes."\n\n" : '').
                    $notes.' on '.now()->format('Y-m-d H:i:s'),
            ]);

            return redirect()
                ->route('landlord.utility-bills.show', ['utilityBill' => $utilityBill->id])
                ->with('success', 'Utility bill waived successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to waive utility bill: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to waive utility bill.');
        }
    }
}
