<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Http\Resources\TenantResource;
use App\Services\RentBillService;
use App\Services\UtilityService;
use App\Http\Requests\Landlord\StoreTenantRequest;
use App\Http\Requests\Landlord\UpdateTenantRequest;
use App\Http\Requests\Landlord\ChangeUnitRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordTenantController extends Controller
{
    protected RentBillService $rentBillService;
    protected UtilityService $utilityService;

    public function __construct(RentBillService $rentBillService, UtilityService $utilityService)
    {
        $this->rentBillService = $rentBillService;
        $this->utilityService = $utilityService;
        $this->authorizeResource(Tenant::class, 'tenant');
    }

    /**
     * Display a listing of active tenancies across properties.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $selectedPropertyId = $request->get('property');
        
        // 1. Get properties for the filter dropdown
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        // 2. Build Tenant Query (Joining Tenancy and Property for filtering and data)
        $query = Tenant::query()
            ->join('tenancies', 'tenants.id', '=', 'tenancies.tenant_id')
            ->join('units', 'tenancies.unit_id', '=', 'units.id')
            ->join('properties', 'units.property_id', '=', 'properties.id')
            ->where('tenancies.status', 'active')
            ->where('properties.owner_id', $landlord->id)
            ->select(
                'tenants.*',
                'tenancies.id as tenancy_id',
                'tenancies.status as tenancy_status',
                'units.unit_name',
                'units.unit_code',
                'properties.id as property_id',
                'properties.name as property_name',
                'properties.address as property_address'
            );

        // Filter by property if selected
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $query->where('properties.id', $selectedPropertyId);
        }

        // Apply search if provided
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('tenants.full_name', 'like', "%{$search}%")
                  ->orWhere('tenants.email', 'like', "%{$search}%")
                  ->orWhere('tenants.tenant_code', 'like', "%{$search}%");
            });
        }

        // 3. Paginate and Transform
        $tenants = $query->paginate(15);

        // 4. Calculate stats (Global, ignore pagination)
        $statsQuery = Property::where('owner_id', $landlord->id);
        
        $totalProperties = $properties->count();
        $totalUnits = $statsQuery->sum('total_units');
        $occupiedUnits = Tenancy::where('tenancies.status', 'active')
            ->whereHas('unit.property', function ($q) use ($landlord) {
                $q->where('owner_id', $landlord->id);
            })->count();

        return Inertia::render('landlord/tenants/index', [
            'tenants' => TenantResource::collection($tenants), // Now a LengthAwarePaginator
            'properties' => $properties,
            'stats' => [
                'total_tenants' => $occupiedUnits, // Based on active tenancies
                'total_properties' => $totalProperties,
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
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'status' => $t->status,
                    'move_in_date' => $t->move_in_date,
                    'move_out_date' => $t->move_out_date,
                    'monthly_rent' => $t->monthly_rent,
                    'unit_name' => $t->unit?->unit_name,
                    'property_name' => $t->unit?->property?->name,
                ];
            });

        return Inertia::render('landlord/tenants/show', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => $activeTenancy,
            'unit' => $activeTenancy?->unit,
            'property' => $activeTenancy?->unit?->property,
            'payments' => \App\Http\Resources\PaymentResource::collection($payments),
            'tenancy_history' => $tenancyHistory,
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
        if ($tenancy->unit->property->owner_id !== $landlord->id) abort(403);

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
        $landlord = $request->user();
        
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('landlord/tenants/create', [
            'properties' => $properties,
        ]);
    }

    /**
     * Store a newly created tenant.
     */
    public function store(StoreTenantRequest $request)
    {
        $landlord = $request->user();

        $validated = $request->validated();

        return \DB::transaction(function () use ($validated, $landlord) {
            // 1. Create or Find Tenant
            $tenant = Tenant::updateOrCreate(
                ['email' => $validated['email'], 'phone' => $validated['phone']],
                [
                    'full_name' => $validated['full_name'],
                    'tenant_code' => 'TNT-' . strtoupper(bin2hex(random_bytes(3))),
                ]
            );

            // 2. Create Tenancy
            $tenancy = Tenancy::create([
                'tenant_id' => $tenant->id,
                'unit_id' => $validated['unit_id'],
                'move_in_date' => $validated['move_in_date'],
                'monthly_rent' => $validated['monthly_rent'],
                'security_deposit' => $validated['security_deposit'] ?? 0,
                'status' => 'active',
            ]);

            // 3. Mark unit as occupied
            \App\Models\Unit::where('id', $validated['unit_id'])->update(['status' => 'occupied']);

            return redirect()
                ->route('landlord.tenants.index')
                ->with('success', 'Tenant added successfully!');
        });
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
            \App\Models\Unit::where('id', $validated['new_unit_id'])->update(['status' => 'occupied']);

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
