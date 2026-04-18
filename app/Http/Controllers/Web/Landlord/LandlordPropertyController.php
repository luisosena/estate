<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Services\Landlord\PropertyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordPropertyController extends Controller
{
    public function __construct(protected PropertyService $service)
    {
        $this->authorizeResource(Property::class, 'property');
    }

    /**
     * Display a listing of properties.
     */
    public function index(Request $request)
    {
        $data = $this->service->getPropertyList($request->user());

        return Inertia::render('landlord/properties/index', [
            'properties' => PropertyResource::collection($data['properties']),
            'stats' => $data['stats'],
            'filters' => ['search' => $request->get('search')],
        ]);
    }
}
