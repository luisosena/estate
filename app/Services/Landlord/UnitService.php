<?php

namespace App\Services\Landlord;

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;

class UnitService
{
    /**
     * Get units list with metrics for a landlord.
     */
    public function getUnitList(User $landlord, Request $request): array
    {
        $selectedPropertyId = $request->get('property');

        // 1. Get properties for categorization
        $properties = $landlord->properties()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // 2. Build Query
        $query = Unit::whereHas('property', fn ($q) => $q->where('owner_id', $landlord->id))
            ->with('property:id,name');

        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $query->where('property_id', $selectedPropertyId);
        }

        $units = $query->orderBy('property_id')
            ->orderBy('unit_code')
            ->paginate(15);

        // 3. Global metrics
        $metrics = $this->calculateMetrics($landlord, $properties->count());

        // 4. Property specific metrics if needed
        $propertyMetrics = null;
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $propertyMetrics = $this->calculatePropertyMetrics($selectedPropertyId);
        }

        return [
            'units' => $units,
            'properties' => $properties,
            'metrics' => $metrics,
            'propertyMetrics' => $propertyMetrics,
            'selectedProperty' => $selectedPropertyId ?: 'all',
        ];
    }

    /**
     * Create a new unit for a property.
     */
    public function createUnit(\App\Models\User $landlord, array $data): \App\Models\Unit
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($landlord, $data) {
            $property = \App\Models\Property::where('owner_id', $landlord->id)
                ->findOrFail($data['property_id']);

            $unit = \App\Models\Unit::create([
                'property_id' => $property->id,
                'unit_code' => $data['unit_code'],
                'unit_name' => $data['unit_name'],
                'status' => 'available',
            ]);

            $property->increment('total_units');

            return $unit;
        });
    }

    /**
     * Calculate global metrics for the landlord.
     */
    protected function calculateMetrics(User $landlord, int $propertyCount): array
    {
        $metricsQuery = Unit::whereHas('property', fn ($q) => $q->where('owner_id', $landlord->id));

        $totalUnits = (clone $metricsQuery)->count();
        $occupiedUnits = (clone $metricsQuery)->where('status', 'occupied')->count();

        return [
            'total_units' => $totalUnits,
            'available_units' => (clone $metricsQuery)->where('status', 'available')->count(),
            'occupied_units' => $occupiedUnits,
            'occupancy_rate' => $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0,
            'total_properties' => $propertyCount,
        ];
    }

    /**
     * Calculate metrics for a specific property.
     */
    protected function calculatePropertyMetrics(int|string $propertyId): array
    {
        $propMetricsQuery = Unit::where('property_id', $propertyId);
        $propTotal = (clone $propMetricsQuery)->count();
        $propOccupied = (clone $propMetricsQuery)->where('status', 'occupied')->count();

        return [
            'total_units' => $propTotal,
            'available_units' => (clone $propMetricsQuery)->where('status', 'available')->count(),
            'occupied_units' => $propOccupied,
            'occupancy_rate' => $propTotal > 0 ? round(($propOccupied / $propTotal) * 100, 1) : 0,
            'total_properties' => 1,
        ];
    }
}
