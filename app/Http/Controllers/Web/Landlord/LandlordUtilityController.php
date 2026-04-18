<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\StoreUtilityRequest;
use App\Http\Requests\Landlord\UpdateUtilityRequest;
use App\Http\Resources\TenancyResource;
use App\Http\Resources\TenancyUtilityResource;
use App\Http\Resources\UtilityTypeResource;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\UtilityType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LandlordUtilityController extends Controller
{
    /**
     * Display a listing of utilities across all tenancies.
     */
    public function __construct()
    {
        // Authorization handled explicitly in methods
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', TenancyUtility::class);

        $landlord = $request->user();

        $tenancies = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->where('status', 'active')
            ->with(['unit.property', 'tenant', 'tenancyUtilities.utilityType', 'tenancyUtilities.bills'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('landlord/utilities/index', [
            'tenancies' => TenancyResource::collection($tenancies),
        ]);
    }

    /**
     * Show the form for assigning utilities to a tenancy.
     */
    public function create(Request $request, Tenancy $tenancy)
    {
        $this->authorize('update', $tenancy);

        $utilityTypes = UtilityType::active()->orderBy('name')->get();

        // Get existing utility type IDs for this tenancy
        $existingTypeIds = $tenancy->tenancyUtilities()
            ->pluck('utility_type_id')
            ->toArray();

        // Filter out already assigned utility types
        $availableTypes = $utilityTypes->filter(function ($type) use ($existingTypeIds) {
            return ! in_array($type->id, $existingTypeIds);
        });

        return Inertia::render('landlord/utilities/create', [
            'tenancy' => new TenancyResource($tenancy->load(['unit.property', 'tenant'])),
            'utilityTypes' => UtilityTypeResource::collection($availableTypes->values()),
            'existingUtilities' => TenancyUtilityResource::collection($tenancy->tenancyUtilities()->with(['utilityType', 'bills'])->get()),
        ]);
    }

    /**
     * Store a newly assigned utility.
     */
    public function store(StoreUtilityRequest $request, Tenancy $tenancy)
    {
        $this->authorize('update', $tenancy);

        $validated = $request->validated();

        try {
            TenancyUtility::create([
                'tenancy_id' => $tenancy->id,
                'utility_type_id' => $validated['utility_type_id'],
                'amount' => $validated['amount'],
                'billing_cycle' => $validated['billing_cycle'],
                'provider' => $validated['provider'] ?? null,
                'account_number' => $validated['account_number'] ?? null,
                'meter_number' => $validated['meter_number'] ?? null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            return redirect()
                ->route('landlord.utilities.index')
                ->with('success', 'Utility assigned successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to assign utility: '.$e->getMessage());

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to assign utility.');
        }
    }

    /**
     * Display utilities for a specific tenancy.
     */
    public function show(Request $request, Tenancy $tenancy)
    {
        $this->authorize('view', $tenancy);

        $tenancy->load(['unit.property', 'tenant', 'tenancyUtilities.utilityType', 'tenancyUtilities.bills']);

        return Inertia::render('landlord/utilities/show', [
            'tenancy' => new TenancyResource($tenancy),
        ]);
    }

    /**
     * Show the form for editing a tenancy utility.
     */
    public function edit(Request $request, TenancyUtility $tenancyUtility)
    {
        $this->authorize('update', $tenancyUtility);

        return Inertia::render('landlord/utilities/edit', [
            'tenancyUtility' => new TenancyUtilityResource($tenancyUtility->load(['utilityType', 'bills'])),
            'tenancy' => new TenancyResource($tenancyUtility->tenancy->load('unit.property', 'tenant')),
            'utilityTypes' => UtilityTypeResource::collection(UtilityType::active()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update a tenancy utility.
     */
    public function update(UpdateUtilityRequest $request, TenancyUtility $tenancyUtility)
    {
        $this->authorize('update', $tenancyUtility);

        $validated = $request->validated();

        try {
            $tenancyUtility->update($validated);

            return redirect()
                ->route('landlord.utilities.show', ['tenancy' => $tenancyUtility->tenancy_id])
                ->with('success', 'Utility updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update utility: '.$e->getMessage());

            return redirect()->back()->withInput()->with('error', 'Failed to update utility.');
        }
    }

    /**
     * Remove a utility from a tenancy.
     */
    public function destroy(Request $request, TenancyUtility $tenancyUtility)
    {
        $this->authorize('delete', $tenancyUtility);

        try {
            $unpaidBills = $tenancyUtility->bills()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->exists();

            if ($unpaidBills) {
                return redirect()
                    ->back()
                    ->with('error', 'Cannot remove utility with unpaid bills.');
            }

            $tenancyUtility->delete();

            return redirect()
                ->route('landlord.utilities.index')
                ->with('success', 'Utility removed successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to remove utility: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to remove utility.');
        }
    }
}
