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
            'tenant' => $this->when($this->relationLoaded('tenancy') && $this->tenancy?->relationLoaded('tenant'), function () {
                $tenant = $this->tenancy->tenant;

                return $tenant ? [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'tenant_code' => $tenant->tenant_code,
                    'phone' => $tenant->phone,
                    'email' => $tenant->email,
                ] : null;
            }),
            'unit' => $this->when($this->relationLoaded('tenancy') && $this->tenancy?->relationLoaded('unit'), function () {
                $unit = $this->tenancy->unit;

                return $unit ? [
                    'id' => $unit->id,
                    'unit_code' => $unit->unit_code,
                ] : null;
            }),
            'property' => $this->when($this->relationLoaded('tenancy') && $this->tenancy?->relationLoaded('unit') && $this->tenancy->unit?->relationLoaded('property'), function () {
                $property = $this->tenancy->unit->property;

                return $property ? [
                    'id' => $property->id,
                    'name' => $property->name,
                ] : null;
            }),
        ];
    }
}
