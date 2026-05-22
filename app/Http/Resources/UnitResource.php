<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
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
            'property_id' => $this->property_id,
            'unit_code' => $this->unit_code,
            'unit_name' => $this->unit_name,
            'status' => $this->status,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'property_name' => $this->when($this->relationLoaded('property'), function () {
                return $this->property?->name;
            }),
            'property_address' => $this->when($this->relationLoaded('property'), function () {
                return $this->property?->address;
            }),

            // Relationships
            'property' => PropertyResource::make($this->whenLoaded('property')),
            'tenancies' => TenancyResource::collection($this->whenLoaded('tenancies')),
        ];
    }
}
