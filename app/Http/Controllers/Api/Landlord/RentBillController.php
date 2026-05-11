<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use App\Services\RentBillService;
use Illuminate\Http\Request;

class RentBillController extends Controller
{
    protected RentBillService $rentBillService;

    public function __construct(RentBillService $rentBillService)
    {
        $this->rentBillService = $rentBillService;
    }

    /**
     * Get all rent bills for the landlord.
     * GET /api/v1/landlord/rent-bills
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $propertyId = $request->get('property_id');
        $tenantId = $request->get('tenant_id');

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenancy.tenant:id,full_name,tenant_code', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($propertyId) {
            $query->whereHas('tenancy.unit', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            });
        }

        if ($tenantId) {
            $query->whereHas('tenancy', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            });
        }

        $totalItems = $query->count();
        $rentBills = $query->orderBy('billing_month', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($bill) => $this->transformRentBill($bill));

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $rentBills,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Transform a rent bill model into a standardized array.
     */
    private function transformRentBill(RentBill $bill): array
    {
        return [
            'id' => $bill->id,
            'billing_month' => $bill->billing_month->format('Y-m'),
            'amount_due' => (float) $bill->amount_due,
            'amount_paid' => (float) $bill->amount_paid,
            'outstanding_amount' => (float) $bill->outstanding_amount,
            'due_date' => $bill->due_date->format('Y-m-d'),
            'status' => $bill->status,
            'notes' => $bill->notes,
            'tenant' => $bill->tenancy?->tenant ? [
                'id' => $bill->tenancy->tenant->id,
                'full_name' => $bill->tenancy->tenant->full_name,
                'tenant_code' => $bill->tenancy->tenant->tenant_code,
                'phone' => $bill->tenancy->tenant->phone,
                'email' => $bill->tenancy->tenant->email,
            ] : null,
            'unit' => $bill->tenancy?->unit ? [
                'id' => $bill->tenancy->unit->id,
                'unit_code' => $bill->tenancy->unit->unit_code,
            ] : null,
            'property' => $bill->tenancy?->unit?->property ? [
                'id' => $bill->tenancy->unit->property->id,
                'name' => $bill->tenancy->unit->property->name,
            ] : null,
            'payments' => $bill->relationLoaded('payments') ? $bill->payments->map(fn ($p) => [
                'id' => $p->id,
                'amount' => (float) $p->amount,
                'paid_at' => $p->paid_at ? $p->paid_at->toISOString() : null,
                'status' => $p->status,
            ]) : [],
            'created_at' => $bill->created_at,
        ];
    }

    /**
     * Get a single rent bill.
     * GET /api/v1/landlord/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $rentBill = RentBill::with([
            'tenancy.tenant:id,full_name,tenant_code,phone,email',
            'tenancy.unit:id,unit_code,property_id',
            'tenancy.unit.property:id,name',
            'payments:id,rent_bill_id,amount,paid_at,status',
        ])->findOrFail($id);

        $this->authorize('view', $rentBill);

        return response()->json([
            'data' => $this->transformRentBill($rentBill),
        ]);
    }

    /**
     * Get overdue rent bills.
     * GET /api/v1/landlord/rent-bills/overdue
     */
    public function overdue(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->overdue()
            ->with(['tenancy.tenant:id,full_name,tenant_code', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name'])
            ->orderBy('due_date', 'asc');

        $totalItems = $query->count();
        $rentBills = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($bill) => $this->transformRentBill($bill));

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $rentBills,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Get pending rent bills.
     * GET /api/v1/landlord/rent-bills/pending
     */
    public function pending(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->pending()
            ->with(['tenancy.tenant:id,full_name,tenant_code', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name'])
            ->orderBy('due_date', 'asc');

        $totalItems = $query->count();
        $rentBills = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($bill) => $this->transformRentBill($bill));

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $rentBills,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Waive a rent bill.
     * POST /api/v1/landlord/rent-bills/{id}/waive
     */
    public function waive(Request $request, int $id)
    {
        $rentBill = RentBill::findOrFail($id);
        $this->authorize('waive', $rentBill);

        // Check if already waived or paid
        if (in_array($rentBill->status, ['waived', 'paid'])) {
            return response()->json([
                'message' => "Cannot waive a rent bill that is already {$rentBill->status}.",
            ], 422);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->rentBillService->waiveRentBill($rentBill, $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Rent bill waived successfully',
            'data' => $this->transformRentBill($rentBill),
        ]);
    }
}
