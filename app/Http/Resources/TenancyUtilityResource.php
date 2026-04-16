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
            'amount' => (float) $this->amount,
            'type' => $this->utilityType?->name,
            'billing_period' => $this->billing_cycle,
            'status' => $this->bills
                ?->filter(fn($b) => in_array($b->status, ['pending', 'partial', 'overdue']))
                ?->isEmpty() ? 'paid' : $this->bills?->filter(fn($b) => in_array($b->status, ['pending', 'partial', 'overdue']))?->first()?->status,
            'pending_balance' => (float) ($this->bills
                ?->filter(fn($b) => in_array($b->status, ['pending', 'partial', 'overdue']))
                ?->sum(fn($b) => $b->amount_due - $b->amount_paid) ?? 0),
            
            // Relationships
            'utility_type' => UtilityTypeResource::make($this->whenLoaded('utilityType')),
            'tenancy' => TenancyResource::make($this->whenLoaded('tenancy')),
            'bills' => UtilityBillResource::collection($this->whenLoaded('bills')),
        ];
    }
}
