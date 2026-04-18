<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\WaiveBillRequest;
use App\Http\Resources\RentBillResource;
use App\Models\RentBill;
use App\Services\RentBillService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordRentBillController extends Controller
{
    public function __construct(protected RentBillService $service) {}

    /**
     * List all rent bills for the landlord.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $data = $this->service->getRentBillList($landlord, $request);

        return Inertia::render('landlord/rent-bills/index', [
            'rentBills' => RentBillResource::collection($data['rent_bills']),
            'stats' => $data['stats'],
            'filters' => $data['filters'],
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

        app(RentBillService::class)->waiveRentBill($rentBill, $validated['notes'] ?? null);

        return redirect()
            ->route('landlord.rent-bills.show', ['rentBill' => $rentBill->id])
            ->with('success', 'Rent bill waived successfully.');
    }
}
