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
use App\Services\Landlord\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordTenantController extends Controller
{
    public function __construct(
        protected OnboardingService $onboardingService,
        protected TenantService $tenantService
    ) {
        // Authorization handled explicitly in methods
    }

    /**
     * Display a listing of active tenancies across properties.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Tenant::class);

        $landlord = $request->user();
        $data = $this->tenantService->getTenantList($landlord, $request);

        return Inertia::render('landlord/tenants/index', [
            'tenants' => TenantResource::collection($data['tenants']),
            'properties' => PropertyResource::collection($landlord->properties()->orderBy('name')->get())->resolve(),
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }

    /**
     * Display tenancies for a specific property.
     */
    public function byProperty(Request $request, $propertyId)
    {
        $this->authorize('viewAny', Tenant::class);

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
            'property' => new PropertyResource($property),
        ]);
    }

    /**
     * Display the specified tenant.
     */
    public function show(Request $request, Tenant $tenant)
    {
        $this->authorize('view', $tenant);

        $activeTenancy = $tenant->tenancies()
            ->where('tenancies.status', 'active')
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

        $documents = $activeTenancy
            ? $activeTenancy->documents()->orderByDesc('uploaded_at')->get()
            : collect();

        return Inertia::render('landlord/tenants/show', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => $activeTenancy ? new TenancyResource($activeTenancy) : null,
            'unit' => $activeTenancy?->unit ? new UnitResource($activeTenancy->unit) : null,
            'property' => $activeTenancy?->unit?->property ? new PropertyResource($activeTenancy->unit->property) : null,
            'payments' => PaymentResource::collection($payments),
            'tenancy_history' => TenancyResource::collection($tenancyHistory),
            'documents' => $documents,
            'outstandingRent' => 0, // Placeholder for logic
            'outstandingUtilities' => 0, // Placeholder
        ]);
    }

    /**
     * Update tenant information.
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        $this->authorize('update', $tenant);

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
        $this->authorize('create', Tenant::class);

        $availableUnits = Unit::whereHas('property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })
        ->where('status', 'available')
        ->with('property:id,name,address')
        ->get();

        return Inertia::render('landlord/tenants/create', [
            'availableUnits' => $availableUnits,
        ]);
    }

    /**
     * Store a newly created tenant.
     */
    public function store(OnboardTenantRequest $request)
    {
        $this->authorize('create', Tenant::class);

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

        $this->tenantService->changeUnit($tenancy, $request->validated('new_unit_id'));

        return redirect()->back()->with('success', 'Unit changed successfully.');
    }

    /**
     * Remove tenant (alias for endTenancy in some contexts).
     */
    public function removeTenant(Request $request, Tenancy $tenancy)
    {
        return $this->endTenancy($request, $tenancy);
    }
}
