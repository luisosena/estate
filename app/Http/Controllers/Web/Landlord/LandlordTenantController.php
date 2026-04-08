<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use App\Http\Requests\StoreTenantWithTenancyRequest;
use App\Services\RentBillService;
use App\Services\UtilityService;
use App\Notifications\TenancyEndedWithBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LandlordTenantController extends Controller
{
    protected RentBillService $rentBillService;
    protected UtilityService $utilityService;

    public function __construct(RentBillService $rentBillService, UtilityService $utilityService)
    {
        $this->rentBillService = $rentBillService;
        $this->utilityService = $utilityService;
    }
    /**
     * Display ALL tenants across every property owned by the authenticated landlord.
     *
     * Route: GET /landlord/tenants
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get selected property filter
        $selectedPropertyId = $request->get('property');
        
        // Get all properties for categorization
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        // Build the base query
        $query = Property::where('owner_id', $landlord->id)
            ->with([
                'units.tenancies' => function ($query) {
                    $query->where('status', 'active')
                          ->with('tenant');
                },
            ]);

        // Apply property filter if selected
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $query->where('id', $selectedPropertyId);
        }

        $propertiesData = $query->get();

        // Flatten into a list of tenant rows for the view.
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

        // If a specific property is selected, calculate property-specific metrics
        $propertyMetrics = null;
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $selectedProperty = $properties->firstWhere('id', (int)$selectedPropertyId);
            if ($selectedProperty) {
                $propertyTenants = array_filter($tenants, fn($t) => $t['property_id'] == $selectedPropertyId);
                $propertyUnits = $propertiesData->firstWhere('id', (int)$selectedPropertyId)->units;
                $propertyOccupiedUnits = $propertyUnits->filter(function ($unit) {
                    return $unit->tenancies->isNotEmpty();
                })->count();
                
                $propertyMetrics = [
                    'total_tenants' => count($propertyTenants),
                    'total_units' => $propertyUnits->count(),
                    'occupied_units' => $propertyOccupiedUnits,
                    'occupancy_rate' => $propertyUnits->count() > 0 
                        ? round(($propertyOccupiedUnits / $propertyUnits->count()) * 100, 1) 
                        : 0,
                ];
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
            'selectedProperty' => $selectedPropertyId ?: 'all',
            'metrics' => [
                'total_tenants' => $totalTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $occupancyRate,
            ],
            'propertyMetrics' => $propertyMetrics,
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
        $tenancy->load(['unit.property', 'tenant']);
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

            // Check for outstanding balance and notify landlord
            $outstandingRent = $this->rentBillService->calculateTotalOutstanding($tenancy->id);
            $utilitySummary = $this->utilityService->getBillsForTenant($tenancy->tenant);
            $outstandingUtilities = $utilitySummary['outstanding'] ?? 0;
            $totalOutstanding = $outstandingRent + $outstandingUtilities;

            if ($totalOutstanding > 0) {
                $landlord->notify(new TenancyEndedWithBalance($tenancy, $totalOutstanding));
            }

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
        $tenancy->load(['unit.property', 'tenant']);
        $landlord = $request->user();
        
        // Authorization: ensure this tenancy belongs to the landlord's property
        if ($tenancy->unit->property->owner_id !== $landlord->id) {
            abort(403, 'You do not have access to this tenancy.');
        }

        // Ensure tenancy is currently active
        if ($tenancy->status !== 'active') {
            return redirect()
                ->back()
                ->with('error', 'This tenancy is already ended.');
        }

        $validated = $request->validate([
            'move_out_date' => 'required|date|after_or_equal:today',
            'end_reason' => 'required|string|in:lease_expiration,tenant_request,landlord_request,non_payment,property_sale,violation,other,automatic_expiry',
            'deposit_return_status' => 'required|string|in:pending,returned_full,returned_partial,withheld',
            'final_meter_readings' => 'nullable|string|max:1000',
        ]);

        try {
            // Update tenancy status and set move_out_date
            $tenancy->update([
                'status' => 'ended',
                'move_out_date' => $validated['move_out_date'],
                'end_reason' => $validated['end_reason'],
                'deposit_return_status' => $validated['deposit_return_status'],
                'final_meter_readings' => $validated['final_meter_readings'],
            ]);

            // Update unit status back to 'available'
            $tenancy->unit->update(['status' => 'available']);

            // Check for outstanding balance and notify landlord
            $outstandingRent = $this->rentBillService->calculateTotalOutstanding($tenancy->id);
            $utilitySummary = $this->utilityService->getBillsForTenant($tenancy->tenant);
            $outstandingUtilities = $utilitySummary['outstanding'] ?? 0;
            $totalOutstanding = $outstandingRent + $outstandingUtilities;

            if ($totalOutstanding > 0) {
                $landlord->notify(new TenancyEndedWithBalance($tenancy, $totalOutstanding));
            }

            // Log additional ending information
            \Log::info('Tenancy ended with details', [
                'tenancy_id' => $tenancy->id,
                'tenant_id' => $tenancy->tenant_id,
                'unit_id' => $tenancy->unit_id,
                'move_out_date' => $validated['move_out_date'],
                'end_reason' => $validated['end_reason'],
                'deposit_return_status' => $validated['deposit_return_status'],
                'final_meter_readings' => $validated['final_meter_readings'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenancy->tenant->tenant_code])
                ->with('success', 'Tenancy has been ended successfully. Unit is now available.');

        } catch (\Exception $e) {
            \Log::error('Failed to end tenancy', [
                'tenancy_id' => $tenancy->id,
                'error' => $e->getMessage(),
                'validated_data' => $validated,
            ]);

            return redirect()
                ->back()
                ->withInput()
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

        // Get available units for unit editing
        $availableUnits = $this->getAvailableUnitsForLandlord($landlord);

        // Get outstanding balances
        $outstandingRent = $this->rentBillService->calculateTotalOutstanding($activeTenancy->id ?? 0);
        $utilitySummary = $this->utilityService->getBillsForTenant($tenant);
        $outstandingUtilities = $utilitySummary['outstanding'] ?? 0;

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
                'move_out_date' => $activeTenancy->move_out_date,
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
            'availableUnits' => $availableUnits,
            'outstandingRent' => $outstandingRent,
            'outstandingUtilities' => $outstandingUtilities,
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
            // Tenancy fields
            'status' => 'nullable|string|in:active,ended,pending',
            'move_in_date' => 'nullable|date',
            'move_out_date' => 'nullable|date',
            'monthly_rent' => 'nullable|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',
        ]);

        // Update tenant information
        $tenantFields = [
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
        ];

        if (isset($validated['emergency_contact_name'])) {
            $tenantFields['emergency_contact_name'] = $validated['emergency_contact_name'];
        }
        if (isset($validated['emergency_contact_phone'])) {
            $tenantFields['emergency_contact_phone'] = $validated['emergency_contact_phone'];
        }
        if (isset($validated['emergency_contact_relation'])) {
            $tenantFields['emergency_contact_relation'] = $validated['emergency_contact_relation'];
        }

        $tenant->update($tenantFields);

        // Update tenancy information if provided
        $tenancyFields = [];
        if (isset($validated['status'])) $tenancyFields['status'] = $validated['status'];
        if (isset($validated['move_in_date'])) $tenancyFields['move_in_date'] = $validated['move_in_date'];
        if (isset($validated['move_out_date'])) $tenancyFields['move_out_date'] = $validated['move_out_date'];
        if (isset($validated['monthly_rent'])) $tenancyFields['monthly_rent'] = $validated['monthly_rent'];
        if (isset($validated['security_deposit'])) $tenancyFields['security_deposit'] = $validated['security_deposit'];

        // Debug: Log what we're updating
        \Log::info('Tenancy update attempt', [
            'validated_data' => $validated,
            'tenancy_fields' => $tenancyFields,
            'tenancy_id' => $activeTenancy->id ?? 'no_active_tenancy'
        ]);

        if (!empty($tenancyFields)) {
            // Get the active tenancy for this tenant
            $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
            if ($activeTenancy) {
                $activeTenancy->update($tenancyFields);
                // Refresh the tenant model to get updated data
                $tenant->refresh();
            }
        }

        return redirect()
            ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
            ->with('success', 'Tenant information updated successfully.');
    }

    /**
     * Change tenant's unit.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Tenancy $tenancy
     * @return \Illuminate\Http\RedirectResponse
     */
    public function changeUnit(Request $request, Tenancy $tenancy)
    {
        $landlord = $request->user();
        
        // Authorization: ensure tenancy belongs to landlord's property
        if ($tenancy->unit->property->owner_id !== $landlord->id) {
            abort(403, 'You do not have access to modify this tenancy.');
        }

        $validated = $request->validate([
            'new_unit_id' => 'required|exists:units,id',
        ]);

        try {
            // Get the new unit
            $newUnit = Unit::findOrFail($validated['new_unit_id']);
            
            // Ensure new unit belongs to the same landlord and is available
            if ($newUnit->property->owner_id !== $landlord->id) {
                return redirect()
                    ->back()
                    ->with('error', 'The selected unit does not belong to your properties.');
            }

            if ($newUnit->status !== 'available') {
                return redirect()
                    ->back()
                    ->with('error', 'The selected unit is not available.');
            }

            // Update old unit status to available
            $tenancy->unit->update(['status' => 'available']);

            // Update tenancy with new unit
            $tenancy->update(['unit_id' => $newUnit->id]);

            // Update new unit status to occupied
            $newUnit->update(['status' => 'occupied']);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenancy->tenant->tenant_code])
                ->with('success', 'Unit changed successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to change unit', [
                'tenancy_id' => $tenancy->id,
                'new_unit_id' => $validated['new_unit_id'],
                'error' => $e->getMessage()
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to change unit. Please try again.');
        }
    }
}
