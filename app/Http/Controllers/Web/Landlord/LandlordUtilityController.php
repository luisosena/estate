<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\UtilityType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LandlordUtilityController extends Controller
{
    /**
     * Display a listing of utilities across all tenancies.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        $tenancies = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->where('status', 'active')
            ->with(['unit.property', 'tenant', 'tenancyUtilities.utilityType'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('landlord/utilities/index', [
            'tenancies' => $tenancies,
        ]);
    }

    /**
     * Show the form for assigning utilities to a tenancy.
     */
    public function create(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy - with null safety checks
        $property = $tenancy->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $utilityTypes = UtilityType::active()->orderBy('name')->get();

        // Get existing utility type IDs for this tenancy
        $existingTypeIds = $tenancy->tenancyUtilities()
            ->pluck('utility_type_id')
            ->toArray();

        // Filter out already assigned utility types
        $availableTypes = $utilityTypes->filter(function ($type) use ($existingTypeIds) {
            return !in_array($type->id, $existingTypeIds);
        });

        return Inertia::render('landlord/utilities/create', [
            'tenancy' => $tenancy->load(['unit.property', 'tenant']),
            'utilityTypes' => $availableTypes,
            'existingUtilities' => $tenancy->tenancyUtilities()->with('utilityType')->get(),
        ]);
    }

    /**
     * Store a newly assigned utility.
     */
    public function store(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy - with null safety checks
        $property = $tenancy->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $validated = $request->validate([
            'utility_type_id' => [
                'required',
                'exists:utility_types,id',
                Rule::unique('tenancy_utilities')->where('tenancy_id', $tenancy->id),
            ],
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['required', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ]);

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

            Log::info('Utility assigned to tenancy via web', [
                'tenancy_id' => $tenancy->id,
                'utility_type_id' => $validated['utility_type_id'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.utilities.index')
                ->with('success', 'Utility assigned successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to assign utility', [
                'tenancy_id' => $tenancy->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to assign utility. Please try again.');
        }
    }

    /**
     * Display utilities for a specific tenancy.
     */
    public function show(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy - with null safety checks
        $property = $tenancy->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $tenancy->load(['unit.property', 'tenant', 'tenancyUtilities.utilityType', 'tenancyUtilities.bills']);

        return Inertia::render('landlord/utilities/show', [
            'tenancy' => $tenancy,
        ]);
    }

    /**
     * Show the form for editing a tenancy utility.
     */
    public function edit(Request $request, TenancyUtility $tenancyUtility)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $utilityTypes = UtilityType::active()->orderBy('name')->get();

        return Inertia::render('landlord/utilities/edit', [
            'tenancyUtility' => $tenancyUtility->load('utilityType'),
            'tenancy' => $tenancyUtility->tenancy->load('unit.property', 'tenant'),
            'utilityTypes' => $utilityTypes,
        ]);
    }

    /**
     * Update a tenancy utility.
     */
    public function update(Request $request, TenancyUtility $tenancyUtility)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'billing_cycle' => ['sometimes', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['sometimes', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ]);

        try {
            $tenancyUtility->update($validated);

            Log::info('Tenancy utility updated via web', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.utilities.show', ['tenancy' => $tenancyUtility->tenancy_id])
                ->with('success', 'Utility updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update utility', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update utility. Please try again.');
        }
    }

    /**
     * Remove a utility from a tenancy.
     */
    public function destroy(Request $request, TenancyUtility $tenancyUtility)
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (!$property || $property->owner_id !== $landlord->id) {
            abort(403);
        }

        try {
            // Check for unpaid bills
            $unpaidBills = $tenancyUtility->bills()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->exists();

            if ($unpaidBills) {
                return redirect()
                    ->back()
                    ->with('error', 'Cannot remove utility with unpaid bills. Please resolve outstanding bills first.');
            }

            $tenancyUtility->delete();

            Log::info('Tenancy utility removed via web', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.utilities.index')
                ->with('success', 'Utility removed successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to remove utility', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to remove utility. Please try again.');
        }
    }
}
