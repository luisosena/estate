<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\ChangeUnitRequest;
use App\Http\Requests\Landlord\OnboardTenantRequest;
use App\Http\Requests\Landlord\UpdateTenantRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\TenancyResource;
use App\Http\Resources\TenantResource;
use App\Http\Resources\UnitResource;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Services\Landlord\OnboardingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordTenantController extends Controller
{
    public function __construct(
        protected OnboardingService $onboardingService
    ) {
        $this->authorizeResource(Tenant::class, 'tenant');
    }

    /**
     * Display a listing of active tenancies across properties.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $selectedPropertyId = $request->get('property');

        // 1. Get properties for filter using relationship
        $properties = $landlord->properties()
            ->select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        // 2. Build Tenant Query using relationship-based pattern
        $query = Tenant::query()
            ->whereHas('tenancies.unit.property', function ($q) use ($landlord, $selectedPropertyId) {
                $q->where('owner_id', $landlord->id);
                if ($selectedPropertyId && $selectedPropertyId !== 'all') {
                    $q->where('id', $selectedPropertyId);
                }
            })
            ->with(['tenancies' => function ($q) {
                $q->where('status', 'active')->with(['unit.property']);
            }]);

        // Search logic
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('tenant_code', 'like', "%{$search}%");
            });
        }

        $tenants = $query->paginate(15);

        // 3. Stats using optimized relationship counts
        $totalUnits = $landlord->properties()->sum('total_units');
        $occupiedUnits = Tenancy::where('status', 'active')
            ->whereHas('unit.property', fn ($q) => $q->where('owner_id', $landlord->id))
            ->count();

        return Inertia::render('landlord/tenants/index', [
            'tenants' => TenantResource::collection($tenants),
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_tenants' => $occupiedUnits,
                'total_properties' => $properties->count(),
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
            ],
            'filters' => [
                'property' => $selectedPropertyId,
                'search' => $request->get('search'),
            ],
        ]);
    }

    /**
     * Display tenancies for a specific property.
     */
    public function byProperty(Request $request, $propertyId)
    {
        $landlord = $request->user();
        $property = Property::where('owner_id', $landlord->id)->findOrFail($propertyId);

        $tenants = Tenant::query()
            ->join('tenancies', 'tenants.id', '=', 'tenancies.tenant_id')
            ->join('units', 'tenancies.unit_id', '=', 'units.id')
            ->where('units.property_id', $property->id)
            ->where('tenancies.status', 'active')
            ->select(
                'tenants.*',
                'tenancies.id as tenancy_id',
                'tenancies.status as tenancy_status',
                'units.unit_name',
                'units.unit_code'
            )
            ->get();

        return Inertia::render('landlord/tenants/by-property', [
            'tenants' => TenantResource::collection($tenants),
            'property' => $property,
        ]);
    }

    /**
     * Display the specified tenant.
     */
    public function show(Request $request, Tenant $tenant)
    {
        // View authorization handled by authorizeResource and TenantPolicy

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit.property'])
            ->first();

        $payments = $tenant->payments()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $tenancyHistory = $tenant->tenancies()
            ->with(['unit.property'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('landlord/tenants/show', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => $activeTenancy ? new TenancyResource($activeTenancy) : null,
            'unit' => $activeTenancy?->unit ? new UnitResource($activeTenancy->unit) : null,
            'property' => $activeTenancy?->unit?->property ? new PropertyResource($activeTenancy->unit->property) : null,
            'payments' => PaymentResource::collection($payments),
            'tenancy_history' => TenancyResource::collection($tenancyHistory),
            'outstandingRent' => 0, // Placeholder for logic
            'outstandingUtilities' => 0, // Placeholder
        ]);
    }

    /**
     * Update tenant information.
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        $validated = $request->validated();

        $tenant->update($validated);

        return redirect()->back()->with('success', 'Tenant updated successfully.');
    }

    /**
     * End a tenancy.
     */
    public function endTenancy(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();

        // Verify ownership
        $this->authorize('update', $tenancy);

        $tenancy->update([
            'status' => 'ended',
            'move_out_date' => now(),
        ]);

        // Make unit available
        $tenancy->unit->update(['status' => 'available']);

        return redirect()->back()->with('success', 'Tenancy ended successfully.');
    }

    /**
     * Show the form for creating a new tenant.
     */
    public function create(Request $request)
    {
        $properties = $request->user()->properties()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('landlord/tenants/create', [
            'properties' => PropertyResource::collection($properties),
        ]);
    }

    /**
     * Store a newly created tenant.
     */
    public function store(OnboardTenantRequest $request)
    {
        $this->onboardingService->onboard($request->validated());

        return redirect()
            ->route('landlord.tenants.index')
            ->with('success', 'Tenant added successfully!');
    }

    /**
     * Change a tenant's unit.
     */
    public function changeUnit(ChangeUnitRequest $request, Tenancy $tenancy)
    {
        $this->authorize('update', $tenancy);

        $validated = $request->validated();

        return \DB::transaction(function () use ($validated, $tenancy) {
            // 1. Mark old unit as available
            $tenancy->unit->update(['status' => 'available']);

            // 2. Update tenancy with new unit
            $tenancy->update(['unit_id' => $validated['new_unit_id']]);

            // 3. Mark new unit as occupied
            Unit::where('id', $validated['new_unit_id'])->update(['status' => 'occupied']);

            return redirect()->back()->with('success', 'Unit changed successfully.');
        });
    }

    /**
     * Remove tenant (alias for endTenancy in some contexts).
     */
    public function removeTenant(Request $request, Tenancy $tenancy)
    {
        return $this->endTenancy($request, $tenancy);
    }
}
