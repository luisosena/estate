<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenancyResource extends JsonResource
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
            'unit_id' => $this->unit_id,
            'tenant_id' => $this->tenant_id,
            'status' => $this->status,
            'move_in_date' => $this->move_in_date,
            'move_out_date' => $this->move_out_date,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'unit' => UnitResource::make($this->whenLoaded('unit')),
            'tenant' => TenantResource::make($this->whenLoaded('tenant')),
            'rent_bills' => RentBillResource::collection($this->whenLoaded('rent_bills')),
        ];
    }
}
