<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantWithTenancyRequest;
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
    public function index(Request $request): JsonResponse
    {
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
                    $tenants[] = [
                        'id' => $tenancy->tenant->id,
                        'tenant_code' => $tenancy->tenant->tenant_code,
                        'full_name' => $tenancy->tenant->full_name,
                        'phone' => $tenancy->tenant->phone,
                        'email' => $tenancy->tenant->email,
                        'tenancy_id' => $tenancy->id,
                        'tenancy_status' => $tenancy->status,
                        'unit_name' => $unit->unit_name,
                        'unit_code' => $unit->unit_code,
                        'property_name' => $property->name,
                    ];
                }
            }
        }

        // Stats calculation
        $totalTenants = count($tenants);
        $totalUnits = $propertiesData->sum(fn ($p) => $p->units()->count());
        $occupiedUnits = $propertiesData->sum(fn ($p) => $p->units()->whereHas('tenancies', fn ($q) => $q->where('tenancies.status', 'active'))->count());

        $offset = ($page - 1) * $perPage;

        return response()->json([
            'data' => array_slice($tenants, $offset, $perPage),
            'meta' => [
                'current_page' => (int) $page,
                'total' => $totalTenants,
                'total_pages' => ceil($totalTenants / $perPage),
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
    public function store(StoreTenantWithTenancyRequest $request): JsonResponse
    {
        $result = $this->tenantService->createTenantWithTenancy(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'message' => 'Tenant created successfully',
            'data' => [
                'tenant' => $result['tenant'],
                'tenancy' => $result['tenancy'],
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

        // Authorization check
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->exists();

        if (! $hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $this->tenantService->getTenantDashboardData($tenant),
        ]);
    }

    /**
     * Update basic tenant details.
     */
    public function update(Request $request, string $identifier): JsonResponse
    {
        $tenant = $this->findTenantByIdentifier($identifier);

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|max:255|unique:tenants,email,'.$tenant->id,
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relation' => 'nullable|string|max:100',
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully',
            'data' => $tenant,
        ]);
    }

    /**
     * End a tenancy.
     */
    public function destroy(Request $request, int $tenancyId): JsonResponse
    {
        $tenancy = Tenancy::whereHas('unit.property', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->findOrFail($tenancyId);

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
        if (preg_match('/^TEN-[A-Z0-9]{5,6}$/i', $identifier)) {
            return Tenant::where('tenant_code', strtoupper($identifier))->firstOrFail();
        }

        return Tenant::findOrFail((int) $identifier);
    }
}
