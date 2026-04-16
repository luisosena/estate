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
            
            // Relationships
            'property' => PropertyResource::make($this->whenLoaded('property')),
            'tenancies' => TenancyResource::collection($this->whenLoaded('tenancies')),
        ];
    }
}
