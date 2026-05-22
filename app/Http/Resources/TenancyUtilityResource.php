<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenancyUtilityResource extends JsonResource
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
            'tenancy_id' => $this->tenancy_id,
            'utility_type_id' => $this->utility_type_id,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'amount' => $this->amount,
            'type' => $this->relationLoaded('utilityType') ? $this->utilityType?->name : null,
            'billing_period' => $this->billing_cycle,
            'billing_cycle' => $this->billing_cycle,
            'provider' => $this->provider,
            'account_number' => $this->account_number,
            'meter_number' => $this->meter_number,
            'notes' => $this->notes,
            'status' => $this->relationLoaded('bills')
                ? ($this->bills->filter(fn ($b) => in_array($b->status, ['pending', 'partial', 'overdue']))->isEmpty() ? 'paid' : $this->bills->filter(fn ($b) => in_array($b->status, ['pending', 'partial', 'overdue']))->first()->status)
                : $this->status,
            'pending_balance' => $this->relationLoaded('bills')
                ? (float) $this->bills->filter(fn ($b) => in_array($b->status, ['pending', 'partial', 'overdue']))->sum(fn ($b) => $b->amount_due - $b->amount_paid)
                : null,
            'unit_id' => $this->relationLoaded('tenancy') && $this->tenancy->relationLoaded('unit') ? $this->tenancy->unit?->id : null,
            'unit_code' => $this->relationLoaded('tenancy') && $this->tenancy->relationLoaded('unit') ? $this->tenancy->unit?->unit_code : null,
            'property_id' => $this->relationLoaded('tenancy') && $this->tenancy->relationLoaded('unit') && $this->tenancy->unit?->relationLoaded('property') ? $this->tenancy->unit->property?->id : null,
            'property_name' => $this->relationLoaded('tenancy') && $this->tenancy->relationLoaded('unit') && $this->tenancy->unit?->relationLoaded('property') ? $this->tenancy->unit->property?->name : null,

            // Relationships
            'utility_type' => UtilityTypeResource::make($this->whenLoaded('utilityType')),
            'bills' => UtilityBillResource::collection($this->whenLoaded('bills')),
        ];
    }
}
