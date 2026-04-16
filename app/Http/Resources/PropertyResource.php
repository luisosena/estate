<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'total_units' => $this->total_units,
            'units_count' => $this->whenCounted('units'),
            'tenancies_count' => $this->whenCounted('tenancies'),
            // Computed fields from current controller logic
            'active_tenants_count' => $this->when(isset($this->active_tenants_count), $this->active_tenants_count),
            'occupied_units' => $this->when(isset($this->occupied_units), $this->occupied_units),
            'available_units' => $this->when(isset($this->available_units), $this->available_units),
            'occupancy_rate' => $this->when(isset($this->occupancy_rate), $this->occupancy_rate),
            'created_at' => $this->created_at?->toDateTimeString(),
            // Relationships
            'landlord' => LandlordResource::make($this->whenLoaded('landlord')),
            'owner' => LandlordResource::make($this->whenLoaded('owner')),
            'units' => UnitResource::collection($this->whenLoaded('units')),
            'tenancies' => TenancyResource::collection($this->whenLoaded('tenancies')),
        ];
    }
}
