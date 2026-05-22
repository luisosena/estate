<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\TenantUpdateRequest;
use App\Http\Requests\StoreTenantWithTenancyRequest;
use App\Http\Resources\TenancyResource;
use App\Http\Resources\TenantResource;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {}

    /**
     * Get all tenants for the landlord with stats.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Tenant::class);

        $landlord = $request->user();
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 15);
        $propertyId = $request->input('property_id');

        $query = Property::where('owner_id', $landlord->id)
            ->with([
                'units.tenancies' => function ($query) {
                    $query->where('tenancies.status', 'active')->with('tenant');
                },
            ]);

        if ($propertyId) {
            $query->where('id', $propertyId);
        }

        $propertiesData = $query->get();

        // Business Logic for data flattening
        $tenants = [];
        foreach ($propertiesData as $property) {
            foreach ($property->units as $unit) {
                foreach ($unit->tenancies as $tenancy) {
                    if (! $tenancy->tenant) {
                        continue;
                    }
                    $tenant = $tenancy->tenant;
                    $tenant->tenancy_id = $tenancy->id;
                    $tenant->tenancy_status = $tenancy->status;
                    $tenant->unit_name = $unit->unit_name;
                    $tenant->unit_code = $unit->unit_code;
                    $tenant->property_name = $property->name;
                    $tenants[] = $tenant;
                }
            }
        }

        // Stats calculation
        $totalTenants = count($tenants);
        $totalUnits = $propertiesData->sum(fn ($p) => $p->units()->count());
        $occupiedUnits = $propertiesData->sum(fn ($p) => $p->units()->whereHas('tenancies', fn ($q) => $q->where('tenancies.status', 'active'))->count());

        $offset = ($page - 1) * $perPage;
        $paginatedTenants = array_slice($tenants, $offset, $perPage);

        return TenantResource::collection($paginatedTenants)
            ->additional([
                'meta' => [
                    'current_page' => (int) $page,
                    'total' => $totalTenants,
                    'total_pages' => (int) ceil($totalTenants / $perPage),
                ],
                'stats' => [
                    'total_tenants' => $totalTenants,
                    'total_units' => $totalUnits,
                    'occupied_units' => $occupiedUnits,
                    'occupancy_rate' => $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0,
                ],
            ]);
    }

    /**
     * Create a new tenant with optional tenancy.
     */
    public function store(StoreTenantWithTenancyRequest $request)
    {
        $this->authorize('create', Tenant::class);

        $result = $this->tenantService->createTenantWithTenancy(
            $request->validated()
        );

        return response()->json([
            'message' => 'Tenant created successfully',
            'data' => [
                'tenant' => new TenantResource($result['tenant']),
                'tenancy' => $result['tenancy'] ? new TenancyResource($result['tenancy']) : null,
                'user' => [
                    'username' => $result['credentials']['username'],
                ],
            ],
        ], 201);
    }

    /**
     * Get a single tenant's full profile.
     */
    public function show(Request $request, string $identifier): JsonResponse
    {
        $tenant = $this->findTenantByIdentifier($identifier);
        $this->authorize('view', $tenant);

        return response()->json([
            'data' => $this->tenantService->getTenantDashboardData($tenant),
        ]);
    }

    /**
     * Update basic tenant details.
     */
    public function update(TenantUpdateRequest $request, string $identifier)
    {
        $tenant = $this->findTenantByIdentifier($identifier);
        $this->authorize('update', $tenant);

        $validated = $request->validated();

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully',
            'data' => new TenantResource($tenant),
        ]);
    }

    /**
     * End a tenancy.
     */
    public function destroy(Request $request, int $tenancyId): JsonResponse
    {
        $tenancy = Tenancy::whereHas('unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($tenancyId);
        $this->authorize('delete', $tenancy);

        $tenancy->update([
            'status' => 'ended',
            'move_out_date' => now()->toDateString(),
        ]);

        $tenancy->unit->update(['status' => 'available']);

        return response()->json(['message' => 'Tenancy ended successfully']);
    }

    /**
     * Helper to resolve tenant by ID or Code.
     */
    private function findTenantByIdentifier(string $identifier): Tenant
    {
        $user = auth()->user();
        $query = Tenant::whereHas('tenancies.unit.property', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        });

        if (preg_match('/^TEN-[A-Z0-9]{5,6}$/i', $identifier)) {
            return $query->where('tenant_code', strtoupper($identifier))->firstOrFail();
        }

        return $query->findOrFail((int) $identifier);
    }
}
