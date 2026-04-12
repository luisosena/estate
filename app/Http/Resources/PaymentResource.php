<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'amount'           => $this->amount,
            'payment_type'     => $this->payment_type,
            'payment_method'   => $this->payment_method,
            'status'           => $this->status,
            'paid_at'          => $this->paid_at,
            'due_date'         => $this->due_date,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
            'reference_number' => $this->reference_number,
            'notes'            => $this->notes,
            'receipt_path'     => $this->receipt_path,
            // Gateway tracking fields
            'gateway'          => $this->gateway,
            'gateway_status'   => $this->gateway_status,
            'gateway_reference'=> $this->gateway_reference,
            // Relation-derived display fields (populated when relationships are loaded)
            'tenant_name'      => $this->whenLoaded('tenant', fn() => $this->tenant?->full_name),
            'tenant_code'      => $this->whenLoaded('tenant', fn() => $this->tenant?->tenant_code),
            'unit_number'      => $this->whenLoaded('tenancy', fn() => $this->tenancy?->unit?->unit_code),
            'property_name'    => $this->whenLoaded('tenancy', fn() => $this->tenancy?->unit?->property?->name),
            // Linked bill IDs
            'rent_bill_id'     => $this->rent_bill_id,
            'utility_bill_id'  => $this->utility_bill_id,
            'rent_bill'        => $this->whenLoaded('rentBill', fn() => $this->rentBill ? [
                'id'            => $this->rentBill->id,
                'billing_month' => $this->rentBill->billing_month?->format('Y-m'),
                'status'        => $this->rentBill->status,
            ] : null),
        ];
    }
}
