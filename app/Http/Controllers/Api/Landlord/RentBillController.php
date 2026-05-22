<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Contracts\RentBillServiceInterface;
use App\Enums\BillStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\RentBillUpdateRequest;
use App\Http\Resources\RentBillResource;
use App\Models\RentBill;
use Illuminate\Http\Request;

class RentBillController extends Controller
{
    public function __construct(
        protected RentBillServiceInterface $rentBillService
    ) {}

    /**
     * Get all rent bills for the landlord.
     * GET /api/v1/landlord/rent-bills
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $propertyId = $request->get('property_id');
        $tenantId = $request->get('tenant_id');

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenancy.tenant:id,full_name,tenant_code,phone,email', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name']);

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

        $rentBills = $query->orderBy('billing_month', 'desc')->paginate($perPage);

        return RentBillResource::collection($rentBills);
    }

    /**
     * Get a single rent bill.
     * GET /api/v1/landlord/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->with([
            'tenancy.tenant:id,full_name,tenant_code,phone,email',
            'tenancy.unit:id,unit_code,property_id',
            'tenancy.unit.property:id,name',
            'payments:id,rent_bill_id,amount,paid_at,status',
        ])->findOrFail($id);

        $this->authorize('view', $rentBill);

        return new RentBillResource($rentBill);
    }

    /**
     * Get overdue rent bills.
     * GET /api/v1/landlord/rent-bills/overdue
     */
    public function overdue(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $perPage = $request->get('per_page', 15);

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->overdue()
            ->with(['tenancy.tenant:id,full_name,tenant_code,phone,email', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name'])
            ->orderBy('due_date', 'asc');

        $rentBills = $query->paginate($perPage);

        return RentBillResource::collection($rentBills);
    }

    /**
     * Get pending rent bills.
     * GET /api/v1/landlord/rent-bills/pending
     */
    public function pending(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        $landlord = $request->user();
        $perPage = $request->get('per_page', 15);

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->pending()
            ->with(['tenancy.tenant:id,full_name,tenant_code,phone,email', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name'])
            ->orderBy('due_date', 'asc');

        $rentBills = $query->paginate($perPage);

        return RentBillResource::collection($rentBills);
    }

    /**
     * Waive a rent bill.
     * POST /api/v1/landlord/rent-bills/{id}/waive
     */
    public function waive(RentBillUpdateRequest $request, int $id)
    {
        $rentBill = RentBill::whereHas('tenancy.unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($id);
        $this->authorize('waive', $rentBill);

        // Check if already waived or paid
        if (in_array($rentBill->status, [BillStatus::Waived, BillStatus::Paid])) {
            return response()->json([
                'message' => "Cannot waive a rent bill that is already {$rentBill->status->value}.",
            ], 422);
        }

        $validated = $request->validated();

        $this->rentBillService->waiveRentBill($rentBill, $validated['notes'] ?? null);

        return (new RentBillResource($rentBill))
            ->additional(['message' => 'Rent bill waived successfully']);
    }
}
