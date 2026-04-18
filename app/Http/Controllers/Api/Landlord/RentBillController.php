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
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'billing_month' => $bill->billing_month->format('Y-m'),
                    'amount_due' => $bill->amount_due,
                    'amount_paid' => $bill->amount_paid,
                    'outstanding_amount' => $bill->outstanding_amount,
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'status' => $bill->status,
                    'notes' => $bill->notes,
                    'tenant_name' => $bill->tenancy?->tenant?->full_name,
                    'tenant_code' => $bill->tenancy?->tenant?->tenant_code,
                    'unit_number' => $bill->tenancy?->unit?->unit_code,
                    'property_name' => $bill->tenancy?->unit?->property?->name,
                    'created_at' => $bill->created_at,
                ];
            });

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
     * Get a single rent bill.
     * GET /api/v1/landlord/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $landlord = $request->user();

        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with([
            'tenancy.tenant:id,full_name,tenant_code,phone,email',
            'tenancy.unit:id,unit_code,property_id',
            'tenancy.unit.property:id,name',
            'payments:id,amount,payment_method,paid_at,status,rent_bill_id',
        ])
            ->findOrFail($id);

        return response()->json([
            'id' => $rentBill->id,
            'billing_month' => $rentBill->billing_month->format('Y-m'),
            'amount_due' => $rentBill->amount_due,
            'amount_paid' => $rentBill->amount_paid,
            'outstanding_amount' => $rentBill->outstanding_amount,
            'due_date' => $rentBill->due_date->format('Y-m-d'),
            'status' => $rentBill->status,
            'notes' => $rentBill->notes,
            'tenant' => $rentBill->tenancy?->tenant ? [
                'id' => $rentBill->tenancy->tenant->id,
                'full_name' => $rentBill->tenancy->tenant->full_name,
                'tenant_code' => $rentBill->tenancy->tenant->tenant_code,
                'phone' => $rentBill->tenancy->tenant->phone,
                'email' => $rentBill->tenancy->tenant->email,
            ] : null,
            'unit' => $rentBill->tenancy?->unit ? [
                'id' => $rentBill->tenancy->unit->id,
                'unit_code' => $rentBill->tenancy->unit->unit_code,
            ] : null,
            'property' => $rentBill->tenancy?->unit?->property ? [
                'id' => $rentBill->tenancy->unit->property->id,
                'name' => $rentBill->tenancy->unit->property->name,
            ] : null,
            'payments' => $rentBill->payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at,
                    'status' => $payment->status,
                ];
            }),
            'created_at' => $rentBill->created_at,
        ]);
    }

    /**
     * Get overdue rent bills.
     * GET /api/v1/landlord/rent-bills/overdue
     */
    public function overdue(Request $request)
    {
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
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'billing_month' => $bill->billing_month->format('Y-m'),
                    'amount_due' => $bill->amount_due,
                    'amount_paid' => $bill->amount_paid,
                    'outstanding_amount' => $bill->outstanding_amount,
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'status' => $bill->status,
                    'tenant_name' => $bill->tenancy?->tenant?->full_name,
                    'tenant_code' => $bill->tenancy?->tenant?->tenant_code,
                    'unit_number' => $bill->tenancy?->unit?->unit_code,
                    'property_name' => $bill->tenancy?->unit?->property?->name,
                ];
            });

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
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'billing_month' => $bill->billing_month->format('Y-m'),
                    'amount_due' => $bill->amount_due,
                    'amount_paid' => $bill->amount_paid,
                    'outstanding_amount' => $bill->outstanding_amount,
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'status' => $bill->status,
                    'tenant_name' => $bill->tenancy?->tenant?->full_name,
                    'tenant_code' => $bill->tenancy?->tenant?->tenant_code,
                    'unit_number' => $bill->tenancy?->unit?->unit_code,
                    'property_name' => $bill->tenancy?->unit?->property?->name,
                ];
            });

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
        $landlord = $request->user();

        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->findOrFail($id);

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
            'rent_bill' => [
                'id' => $rentBill->id,
                'billing_month' => $rentBill->billing_month->format('Y-m'),
                'amount_due' => $rentBill->amount_due,
                'amount_paid' => $rentBill->amount_paid,
                'status' => $rentBill->status,
                'notes' => $rentBill->notes,
            ],
        ]);
    }
}
