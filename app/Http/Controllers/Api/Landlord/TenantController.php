<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * Get all tenants for the landlord.
     * GET /api/v1/landlord/tenants
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $propertyId = $request->get('property_id');

        $query = Property::where('owner_id', $landlord->id)
            ->with([
                'units.tenancies' => function ($query) {
                    $query->where('status', 'active')
                          ->with('tenant');
                },
            ]);

        if ($propertyId) {
            $query->where('id', $propertyId);
        }

        $propertiesData = $query->get();

        // Flatten into a list of tenant rows
        $tenants = [];

        foreach ($propertiesData as $property) {
            foreach ($property->units as $unit) {
                foreach ($unit->tenancies as $tenancy) {
                    if (!$tenancy->tenant) {
                        continue;
                    }

                    $tenants[] = [
                        'id'              => $tenancy->tenant->id,
                        'tenant_code'     => $tenancy->tenant->tenant_code,
                        'full_name'       => $tenancy->tenant->full_name,
                        'phone'           => $tenancy->tenant->phone,
                        'email'           => $tenancy->tenant->email,
                        'tenancy_id'      => $tenancy->id,
                        'tenancy_status'  => $tenancy->status,
                        'unit_name'       => $unit->unit_name,
                        'unit_code'       => $unit->unit_code,
                        'property_id'     => $property->id,
                        'property_name'   => $property->name,
                        'property_address'=> $property->address,
                    ];
                }
            }
        }

        // Calculate breakdown metrics
        $totalTenants = count($tenants);
        $properties = Property::where('owner_id', $landlord->id)->get();
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum(function ($property) {
            return $property->units()->count();
        });
        $occupiedUnits = $properties->sum(function ($property) {
            return $property->units()->whereHas('tenancies', function ($query) {
                $query->where('status', 'active');
            })->count();
        });
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // Paginate manually
        $totalItems = count($tenants);
        $totalPages = ceil($totalItems / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedTenants = array_slice($tenants, $offset, $perPage);

        return response()->json([
            'data' => $paginatedTenants,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
            'stats' => [
                'total_tenants' => $totalTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $occupancyRate,
            ],
        ]);
    }

    /**
     * Get a single tenant.
     * GET /api/v1/landlord/tenants/{tenant}
     */
    public function show(Request $request, string $tenantIdentifier)
    {
        $landlord = $request->user();

        // Find tenant by tenant_code or by id using pattern check
        $tenant = $this->findTenantByIdentifier($tenantIdentifier);

        // Verify tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get tenant's tenancies with property and unit info
        $tenancies = $tenant->tenancies()
            ->with(['unit.property:id,name,address'])
            ->get()
            ->map(function ($tenancy) {
                return [
                    'id' => $tenancy->id,
                    'status' => $tenancy->status,
                    'move_in_date' => $tenancy->move_in_date,
                    'move_out_date' => $tenancy->move_out_date,
                    'monthly_rent' => $tenancy->monthly_rent,
                    'security_deposit' => $tenancy->security_deposit,
                    'unit' => $tenancy->unit ? [
                        'id' => $tenancy->unit->id,
                        'unit_name' => $tenancy->unit->unit_name,
                        'unit_code' => $tenancy->unit->unit_code,
                        'property' => $tenancy->unit->property,
                    ] : null,
                ];
            });

        return response()->json([
            'id' => $tenant->id,
            'tenant_code' => $tenant->tenant_code,
            'full_name' => $tenant->full_name,
            'phone' => $tenant->phone,
            'email' => $tenant->email,
            'emergency_contact_name' => $tenant->emergency_contact_name,
            'emergency_contact_phone' => $tenant->emergency_contact_phone,
            'emergency_contact_relation' => $tenant->emergency_contact_relation,
            'tenancies' => $tenancies,
        ]);
    }

    /**
     * Create a new tenant with tenancy.
     * POST /api/v1/landlord/tenants
     */
    public function store(Request $request)
    {
        $landlord = $request->user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'unit_id' => 'required|exists:units,id',
            'move_in_date' => 'required|date',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'required|numeric|min:0',
        ]);

        // Verify unit belongs to landlord's property
        $unit = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })->findOrFail($validated['unit_id']);

        // Check if unit is available
        if ($unit->tenancies()->where('status', 'active')->count() > 0) {
            return response()->json([
                'message' => 'Unit is already occupied',
            ], 422);
        }

        // Create tenant
        $tenant = Tenant::create([
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
            'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? null,
        ]);

        // Generate tenant code
        $tenant->tenant_code = 'TEN-' . strtoupper(Str::random(6));
        $tenant->save();

        // Create tenancy
        $tenancy = Tenancy::create([
            'tenant_id' => $tenant->id,
            'unit_id' => $unit->id,
            'move_in_date' => $validated['move_in_date'],
            'monthly_rent' => $validated['monthly_rent'],
            'security_deposit' => $validated['security_deposit'],
            'status' => 'active',
        ]);

        // Update unit status to occupied
        $unit->update(['status' => 'occupied']);

        // Create user account for tenant
        $username = $this->generateUsername($tenant->full_name);

        $user = User::create([
            'name' => $tenant->full_name,
            'username' => $username,
            'email' => $tenant->email,
            'password' => $username, // Will be hashed automatically by User model's 'password' => 'hashed' cast
            'role' => 'tenant',
            'tenant_id' => $tenant->id,
        ]);

        return response()->json([
            'message' => 'Tenant created successfully',
            'tenant' => [
                'id' => $tenant->id,
                'tenant_code' => $tenant->tenant_code,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'tenancy' => [
                'id' => $tenancy->id,
                'unit_id' => $tenancy->unit_id,
                'move_in_date' => $tenancy->move_in_date,
                'monthly_rent' => $tenancy->monthly_rent,
                'status' => $tenancy->status,
            ],
            'user' => [
                'username' => $username,
            ],
        ], 201);
    }

    /**
     * Update a tenant.
     * PUT /api/v1/landlord/tenants/{tenant}
     */
    public function update(Request $request, string $tenantIdentifier)
    {
        $landlord = $request->user();

        // Find tenant by tenant_code or by id using pattern check
        $tenant = $this->findTenantByIdentifier($tenantIdentifier);

        // Verify tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relation' => 'nullable|string|max:100',
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully',
            'tenant' => [
                'id' => $tenant->id,
                'tenant_code' => $tenant->tenant_code,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
        ]);
    }

    /**
     * Remove a tenant (end tenancy).
     * DELETE /api/v1/landlord/tenants/{tenancy}/remove
     */
    public function destroy(Request $request, int $tenancyId)
    {
        $landlord = $request->user();

        $tenancy = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })->findOrFail($tenancyId);

        // Update tenancy status and set move_out_date
        $tenancy->update([
            'status' => 'ended',
            'move_out_date' => now()->toDateString(),
        ]);

        // Update unit status back to available
        $tenancy->unit->update(['status' => 'available']);

        return response()->json([
            'message' => 'Tenant removed successfully',
        ]);
    }

    /**
     * Generate a unique username from tenant's full name.
     */
    private function generateUsername(string $fullName): string
    {
        do {
            $nameParts = explode(' ', trim($fullName));
            $nameParts = array_filter($nameParts);
            $usernameParts = array_slice($nameParts, 0, 3);
            $base = strtolower(implode('.', $usernameParts));
            $randomNumber = rand(100, 999);
            $username = $base . $randomNumber;
        } while (User::where('username', $username)->exists());

        return $username;
    }

    /**
     * Find a tenant by identifier (ID or tenant_code).
     * Uses pattern matching to determine whether to search by ID or tenant_code.
     * This prevents issues with numeric tenant_codes being misinterpreted as IDs.
     *
     * @param string $identifier The tenant identifier (either numeric ID or tenant_code)
     * @return Tenant The found tenant
     * @throws \Illuminate\Database\QueryException When tenant is not found
     */
    private function findTenantByIdentifier(string $identifier): Tenant
    {
        // Check if identifier matches the tenant_code pattern (TEN-XXXXXX)
        // Tenant codes are generated as 'TEN-' + 6 uppercase alphanumeric characters
        if (preg_match('/^TEN-[A-Z0-9]{6}$/i', $identifier)) {
            $tenant = Tenant::where('tenant_code', strtoupper($identifier))->first();
            
            if (!$tenant) {
                abort(404, "Tenant with code '{$identifier}' not found.");
            }
            
            return $tenant;
        }

        // Check if identifier is a valid numeric ID (positive integer only)
        if (ctype_digit($identifier)) {
            $tenant = Tenant::find((int) $identifier);
            
            if (!$tenant) {
                abort(404, "Tenant with ID '{$identifier}' not found.");
            }
            
            return $tenant;
        }

        // Invalid format - neither valid tenant_code nor numeric ID
        abort(400, "Invalid tenant identifier '{$identifier}'. Expected either a valid tenant ID (numeric) or tenant code (format: TEN-XXXXXX).");
    }
}
