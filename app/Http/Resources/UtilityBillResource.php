<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UtilityBillResource extends JsonResource
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
            'tenancy_utility_id' => $this->tenancy_utility_id,
            'billing_month' => $this->billing_month,
            'amount_due' => $this->amount_due,
            'amount_paid' => $this->amount_paid,
            'due_date' => $this->due_date,
            'status' => $this->status,
            'read_at' => $this->read_at,
            'previous_reading' => $this->previous_reading,
            'current_reading' => $this->current_reading,
            'usage' => $this->usage,
            'notes' => $this->notes,
            'outstanding_amount' => max(0, $this->amount_due - $this->amount_paid),
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'tenancy_utility' => TenancyUtilityResource::make($this->whenLoaded('tenancyUtility')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
