<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use App\Http\Requests\StoreTenantWithTenancyRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LandlordTenantController extends Controller
{
    /**
     * Display ALL tenants across every property owned by the authenticated landlord.
     *
     * Route: GET /landlord/tenants
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Fetch all properties owned by this landlord, with their units,
        // each unit's active tenancies, and each tenancy's tenant.
        $properties = Property::where('owner_id', $landlord->id)
            ->with([
                'units.tenancies' => function ($query) {
                    $query->where('status', 'active')
                          ->with('tenant');
                },
            ])
            ->get();

        // Flatten into a list of tenant rows for the view.
        $tenants = [];

        foreach ($properties as $property) {
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

        // Build a lightweight properties list for the navigation/filter sidebar.
        $propertiesList = $properties->map(fn ($p) => [
            'id'      => $p->id,
            'name'    => $p->name,
            'address' => $p->address,
        ])->values();

        return Inertia::render('landlord/tenants/index', [
            'tenants'    => $tenants,
            'properties' => $propertiesList,
        ]);
    }

    /**
     * Display tenants for a specific property owned by the authenticated landlord.
     *
     * Route: GET /landlord/properties/{property}/tenants
     */
    public function byProperty(Request $request, Property $property)
    {
        $landlord = $request->user();

        // Authorization: ensure this property belongs to the authenticated landlord.
        if ($property->owner_id !== $landlord->id) {
            abort(403, 'You do not have access to this property.');
        }

        // Eager-load units → active tenancies → tenant for this property only.
        $property->load([
            'units.tenancies' => function ($query) {
                $query->where('status', 'active')
                      ->with('tenant');
            },
        ]);

        $tenants = [];

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

        // All properties for the sidebar navigation.
        $allProperties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name', 'address')
            ->get()
            ->map(fn ($p) => [
                'id'      => $p->id,
                'name'    => $p->name,
                'address' => $p->address,
            ])
            ->values();

        return Inertia::render('landlord/tenants/by-property', [
            'tenants'          => $tenants,
            'property'         => [
                'id'      => $property->id,
                'name'    => $property->name,
                'address' => $property->address,
            ],
            'properties'       => $allProperties,
        ]);
    }

    /**
     * Show the form for creating a new tenant with unit assignment and tenancy.
     *
     * Route: GET /landlord/tenants/create
     */
    public function create(Request $request)
    {
        $landlord = $request->user();
        
        // Get available units (units without active tenancies) for this landlord
        $availableUnits = $this->getAvailableUnitsForLandlord($landlord);
        
        return Inertia::render('landlord/tenants/create', [
            'availableUnits' => $availableUnits,
        ]);
    }

    /**
     * Store a newly created tenant with unit assignment and tenancy.
     *
     * Route: POST /landlord/tenants
     */
    public function store(StoreTenantWithTenancyRequest $request)
    {
        $landlord = $request->user();
        
        // Enable query logging
        \DB::enableQueryLog();
        
        // Initialize variables for error handling
        $tenant = null;
        $user = null;
        $tenancy = null;
        $unit = null;
        $agreementPath = null;
        
        try {
            // Create the tenant
            $tenant = Tenant::create([
                'full_name' => $request->full_name,
                'phone' => $request->phone,
                'email' => $request->email,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'emergency_contact_relation' => $request->emergency_contact_relation,
            ]);

            // DEBUG: Log tenant creation
            \Log::info('Tenant created successfully', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->full_name,
                'tenant_email' => $tenant->email
            ]);

            // Create user account for the tenant
            \Log::info('About to create user for tenant', ['tenant_id' => $tenant->id]);
            try {
                $user = $this->createTenantUser($tenant);
                \Log::info('User creation completed', [
                    'user_id' => $user->id ?? 'null',
                    'username' => $user->username ?? 'null',
                    'tenant_id' => $user->tenant_id ?? 'null'
                ]);
            } catch (\Exception $e) {
                \Log::error('User creation failed', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e; // Re-throw to be caught by outer try-catch
            }

            // Handle tenancy agreement upload if present
            $agreementPath = null;
            if ($request->hasFile('tenancy_agreement')) {
                $agreementPath = $request->file('tenancy_agreement')->store('tenancy-agreements', 'public');
            }

            // Create the tenancy
            $tenancy = Tenancy::create([
                'tenant_id' => $tenant->id,
                'unit_id' => $request->unit_id,
                'move_in_date' => $request->move_in_date,
                'monthly_rent' => $request->monthly_rent,
                'security_deposit' => $request->security_deposit,
                'tenancy_agreement_path' => $agreementPath,
                'status' => 'active',
            ]);

            // Update unit status to 'occupied'
            $unit = Unit::find($request->unit_id);
            $unit->update(['status' => 'occupied']);

            return redirect()
                ->route('landlord.tenants.index')
                ->with('success', "Tenant {$tenant->full_name} has been successfully added to the unit. User account created with username: {$user->username}");

        } catch (\Exception $e) {
            // Log all queries
            \Log::info('Database queries executed', [
                'queries' => \DB::getQueryLog(),
                'tenant_id' => $tenant->id ?? 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // If anything fails, clean up any created records
            if (isset($tenant)) {
                // Also delete the associated user if it was created
                if ($tenant->user) {
                    $tenant->user->delete();
                }
                $tenant->delete();
            }
            if (isset($tenancy)) {
                $tenancy->delete();
            }
            if (isset($unit)) {
                // Rollback unit status to 'available'
                $unit->update(['status' => 'available']);
            }
            if ($agreementPath) {
                Storage::disk('public')->delete($agreementPath);
            }

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create tenant. Please try again.');
        }
    }

    /**
     * Remove a tenant (end tenancy and update unit status).
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Tenancy $tenancy
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeTenant(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();
        
        // Authorization: ensure this tenancy belongs to the landlord's property
        if ($tenancy->unit->property->owner_id !== $landlord->id) {
            abort(403, 'You do not have access to this tenant.');
        }

        try {
            // Update tenancy status and set move_out_date
            $tenancy->update([
                'status' => 'ended',
                'move_out_date' => now()->toDateString(),
            ]);

            // Update unit status back to 'available'
            $tenancy->unit->update(['status' => 'available']);

            return redirect()
                ->back()
                ->with('success', 'Tenant has been removed successfully. Unit is now available.');

        } catch (\Exception $e) {
            \Log::error('Failed to remove tenant', [
                'tenancy_id' => $tenancy->id,
                'error' => $e->getMessage()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to remove tenant. Please try again.');
        }
    }

    /**
     * End a tenancy and update unit status to available.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Tenancy $tenancy
     * @return \Illuminate\Http\RedirectResponse
     */
    public function endTenancy(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();
        
        // Authorization: ensure this tenancy belongs to the landlord's property
        if ($tenancy->unit->property->owner_id !== $landlord->id) {
            abort(403, 'You do not have access to this tenancy.');
        }

        try {
            // Update tenancy status and set move_out_date
            $tenancy->update([
                'status' => 'ended',
                'move_out_date' => now()->toDateString(),
            ]);

            // Update unit status back to 'available'
            $tenancy->unit->update(['status' => 'available']);

            return redirect()
                ->back()
                ->with('success', 'Tenancy has been ended successfully. Unit is now available.');

        } catch (\Exception $e) {
            \Log::error('Failed to end tenancy', [
                'tenancy_id' => $tenancy->id,
                'error' => $e->getMessage()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to end tenancy. Please try again.');
        }
    }

    /**
     * Create a user account for the tenant.
     *
     * @param \App\Models\Tenant $tenant
     * @return \App\Models\User
     */
    private function createTenantUser(Tenant $tenant): User
    {
        $username = $this->generateUsername($tenant->full_name);
        $password = $username;

        \Log::info('Creating user with data', [
            'username' => $username,
            'email' => $tenant->email,
            'tenant_id' => $tenant->id,
            'password_length' => strlen($password)
        ]);

        return User::create([
            'name' => $tenant->full_name,
            'username' => $username,
            'email' => $tenant->email,
            'password' => $password, // Let the model handle hashing
            'role' => 'tenant',
            'tenant_id' => $tenant->id,
        ]);
    }

    /**
     * Generate a unique username from tenant's full name.
     *
     * @param string $fullName
     * @return string
     */
    private function generateUsername(string $fullName): string
    {
        do {
            // Split the full name into parts and join with dots
            $nameParts = explode(' ', trim($fullName));
            $nameParts = array_filter($nameParts); // Remove empty parts
            
            // Take first 2-3 parts of the name
            $usernameParts = array_slice($nameParts, 0, 3);
            $base = strtolower(implode('.', $usernameParts));
            
            // Add random number for uniqueness
            $username = $base . '_' . random_int(1000, 9999);
        } while (User::where('username', $username)->exists());

        return $username;
    }

    /**
     * Generate a secure temporary password.
     *
     * @return string
     */
    /*
    private function generatePassword(): string
    {
        return ; // 12-character random string
    }

    /**
     * Get available units for a landlord (units without active tenancies).
     *
     * @param \App\Models\User $landlord
     * @return \Illuminate\Support\Collection
     */
    private function getAvailableUnitsForLandlord($landlord)
    {
        return Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
        ->where('status', 'available')  // Only show available units
        ->whereDoesntHave('tenancies', function ($query) {
            $query->where('status', 'active');
        })
        ->with('property')
        ->get()
        ->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'property' => [
                    'id' => $unit->property->id,
                    'name' => $unit->property->name,
                    'address' => $unit->property->address,
                ],
            ];
        });
    }

    /**
     * Show a specific tenant's details.
     *
     * Route: GET /landlord/tenants/{tenant}
     */
    public function show(Request $request, Tenant $tenant)
    {
        $landlord = $request->user();

        // Authorization: ensure tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to view this tenant.');
        }

        // Get active tenancy with all relations
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit.property', 'payments'])
            ->first();

        // Get all tenancies (including ended) for history
        $allTenancies = $tenant->tenancies()
            ->with(['unit.property'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all properties for sidebar
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name', 'address')
            ->get();

        return Inertia::render('landlord/tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'tenant_code' => $tenant->tenant_code,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
                'emergency_contact_name' => $tenant->emergency_contact_name,
                'emergency_contact_phone' => $tenant->emergency_contact_phone,
                'emergency_contact_relation' => $tenant->emergency_contact_relation,
            ],
            'tenancy' => $activeTenancy ? [
                'id' => $activeTenancy->id,
                'status' => $activeTenancy->status,
                'move_in_date' => $activeTenancy->move_in_date,
                'monthly_rent' => $activeTenancy->monthly_rent,
                'security_deposit' => $activeTenancy->security_deposit,
            ] : null,
            'unit' => $activeTenancy?->unit,
            'property' => $activeTenancy?->unit?->property,
            'payments' => $activeTenancy?->payments ?? [],
            'tenancy_history' => $allTenancies->map(fn ($t) => [
                'id' => $t->id,
                'status' => $t->status,
                'move_in_date' => $t->move_in_date,
                'move_out_date' => $t->move_out_date,
                'monthly_rent' => $t->monthly_rent,
                'unit_name' => $t->unit?->unit_name,
                'property_name' => $t->unit?->property?->name,
            ]),
            'properties' => $properties,
        ]);
    }

    /**
     * Update tenant information.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Tenant $tenant
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Tenant $tenant)
    {
        $landlord = $request->user();
        
        // Authorization: ensure tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to update this tenant.');
        }

        // Validate and update tenant information
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:100',
        ]);

        $tenant->update($validated);

        return redirect()
            ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
            ->with('success', 'Tenant information updated successfully.');
    }
}
