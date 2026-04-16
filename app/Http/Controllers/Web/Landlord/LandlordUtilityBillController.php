<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\UtilityBill;
use App\Http\Resources\UtilityBillResource;
use App\Http\Resources\PropertyResource;
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
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $utilityBill->load([
            'tenancyUtility.utilityType',
            'tenancyUtility.tenancy.unit.property',
            'tenancyUtility.tenancy.tenant',
            'payments',
        ]);

        return Inertia::render('landlord/utility-bills/show', [
            'bill' => new UtilityBillResource($utilityBill),
        ]);
    }

    /**
     * Waive a utility bill.
     */
    public function waive(Request $request, UtilityBill $utilityBill)
    {
        $landlord = $request->user();

        // Verify ownership
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        try {
            if (in_array($utilityBill->status, ['paid', 'waived'])) {
                return redirect()
                    ->back()
                    ->with('error', 'This bill cannot be waived as it is already ' . $utilityBill->status);
            }

            $utilityBill->update([
                'status' => 'waived',
                'notes' => ($utilityBill->notes ? $utilityBill->notes . "\n\n" : '') .
                    'Waived by landlord on ' . now()->format('Y-m-d H:i:s'),
            ]);

            return redirect()
                ->route('landlord.utility-bills.show', ['utilityBill' => $utilityBill->id])
                ->with('success', 'Utility bill waived successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to waive utility bill: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to waive utility bill.');
        }
    }
}
