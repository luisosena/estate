<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentBillResource extends JsonResource
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
            'amount' => $this->amount,
            'billing_month' => is_string($this->billing_month) ? $this->billing_month : $this->billing_month?->format('Y-m'),
            'amount_due' => (float) ($this->amount_due ?? $this->amount),
            'amount_paid' => (float) ($this->amount_paid ?? 0),
            'outstanding_amount' => (float) ($this->outstanding_amount ?? ($this->amount_due - $this->amount_paid)),
            'due_date' => is_string($this->due_date) ? $this->due_date : $this->due_date?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toDateTimeString(),
            // Relationships
            'tenancy' => TenancyResource::make($this->whenLoaded('tenancy')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
