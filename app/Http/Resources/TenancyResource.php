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
            'move_in_date' => $this->move_in_date?->toDateString(),
            'move_out_date' => $this->move_out_date?->toDateString(),
            'monthly_rent' => (float) $this->monthly_rent,
            'security_deposit' => (float) $this->security_deposit,
            'rent_due_day' => (int) $this->rent_due_day,
            'tenancy_agreement_path' => $this->tenancy_agreement_path,
            'deposit_return_status' => $this->deposit_return_status,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'unit' => UnitResource::make($this->whenLoaded('unit')),
            'tenant' => TenantResource::make($this->whenLoaded('tenant')),
            'rent_bills' => RentBillResource::collection($this->whenLoaded('rent_bills')),
            'tenancy_utilities' => TenancyUtilityResource::collection($this->whenLoaded('tenancyUtilities')),
        ];
    }
}
