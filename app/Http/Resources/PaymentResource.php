<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
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
            'payment_type' => $this->payment_type,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'paid_at' => is_string($this->paid_at) ? $this->paid_at : $this->paid_at?->toDateTimeString(),
            'due_date' => $this->due_date,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'reference_number' => $this->reference_number,
            'notes' => $this->notes,
            // Gateway tracking fields (Phase 3)
            'receipt_path' => $this->receipt_path ?? null,
            'gateway' => $this->gateway ?? null,
            'gateway_status' => $this->gateway_status ?? null,
            'gateway_reference' => $this->gateway_reference ?? null,
            'gateway_confirmed_at' => $this->gateway_confirmed_at ?? null,
            // Relation-derived display fields (populated when relationships are loaded)
            'tenant_name' => $this->whenLoaded('tenant', fn () => $this->tenant?->full_name),
            'tenant_code' => $this->whenLoaded('tenant', fn () => $this->tenant?->tenant_code),
            'unit_number' => $this->whenLoaded('tenancy', fn () => $this->tenancy?->unit?->unit_code),
            'property_name' => $this->whenLoaded('tenancy', fn () => $this->tenancy?->unit?->property?->name),
            // Nested resource relationships
            'tenant' => TenantResource::make($this->whenLoaded('tenant')),
            'tenancy' => TenancyResource::make($this->whenLoaded('tenancy')),
            // Linked bill IDs
            'rent_bill_id' => $this->rent_bill_id,
            'utility_bill_id' => $this->utility_bill_id,
            'rent_bill' => $this->whenLoaded('rentBill', fn () => $this->rentBill ? [
                'id' => $this->rentBill->id,
                'billing_month' => $this->rentBill->billing_month?->format('Y-m'),
                'status' => $this->rentBill->status,
            ] : null),
        ];
    }
}
