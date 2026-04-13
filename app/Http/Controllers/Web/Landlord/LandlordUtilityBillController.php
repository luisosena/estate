<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
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
            ]);

        // Apply filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
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

        // Calculate summary stats using a single query with conditional aggregation
        $summaryQuery = UtilityBill::whereHas('tenancyUtility.tenancy.unit.property', function ($q) use ($landlord) {
            $q->where('owner_id', $landlord->id);
        });

        $summary = $summaryQuery->selectRaw(
            "SUM(CASE WHEN status = 'pending' THEN amount_due ELSE 0 END) as total_pending,
             SUM(CASE WHEN status = 'overdue' THEN amount_due ELSE 0 END) as total_overdue,
             SUM(CASE WHEN status = 'partial' THEN amount_due ELSE 0 END) as total_partial"
        )->first();

        $summary = [
            'total_pending' => $summary->total_pending ?? 0,
            'total_overdue' => $summary->total_overdue ?? 0,
            'total_partial' => $summary->total_partial ?? 0,
        ];

        return Inertia::render('landlord/utility-bills/index', [
            'bills' => $bills,
            'properties' => $properties,
            'filters' => [
                'status' => $request->status ?? '',
                'property_id' => $request->property_id ?? '',
            ],
            'summary' => $summary,
        ]);
    }

    /**
     * Display utility bill details.
     */
    public function show(Request $request, UtilityBill $utilityBill)
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill - with null safety checks
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
            'bill' => $utilityBill,
        ]);
    }

    /**
     * Waive a utility bill.
     */
    public function waive(Request $request, UtilityBill $utilityBill)
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill - with null safety checks
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        try {
            // Check if already paid or waived
            if (in_array($utilityBill->status, ['paid', 'waived'])) {
                return redirect()
                    ->back()
                    ->with('error', 'This bill cannot be waived because it is already ' . $utilityBill->status);
            }

            $utilityBill->update([
                'status' => 'waived',
                'notes' => ($utilityBill->notes ? $utilityBill->notes . "\n\n" : '') .
                    'Waived by landlord on ' . now()->format('Y-m-d H:i:s'),
            ]);

            Log::info('Utility bill waived via web', [
                'utility_bill_id' => $utilityBill->id,
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.utility-bills.show', ['utilityBill' => $utilityBill->id])
                ->with('success', 'Utility bill waived successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to waive utility bill', [
                'utility_bill_id' => $utilityBill->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to waive utility bill. Please try again.');
        }
    }
}
