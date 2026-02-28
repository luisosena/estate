<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LandlordController extends Controller
{
    /**
     * Get available units for the authenticated landlord.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAvailableUnits(Request $request): JsonResponse
    {
        $landlord = $request->user();
        
        $availableUnits = Unit::whereHas('property', function ($query) use ($landlord) {
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
                'unit_name' => $unit->unit_name,
                'unit_code' => $unit->unit_code,
                'property' => [
                    'id' => $unit->property->id,
                    'name' => $unit->property->name,
                    'address' => $unit->property->address,
                ],
            ];
        });

        return response()->json($availableUnits);
    }
}
