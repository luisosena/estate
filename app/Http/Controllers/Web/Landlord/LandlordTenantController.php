<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
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
                        'move_in_date'    => $tenancy->move_in_date,
                        'move_out_date'   => $tenancy->move_out_date,
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
                    'move_in_date'    => $tenancy->move_in_date,
                    'move_out_date'   => $tenancy->move_out_date,
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
}
