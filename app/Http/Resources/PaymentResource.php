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
            'transaction_id' => $this->when(isset($this->transaction_id), $this->transaction_id),
            'paid_at' => is_string($this->paid_at) ? $this->paid_at : $this->paid_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            // Relationships
            'tenant' => TenantResource::make($this->whenLoaded('tenant')),
            'tenancy' => TenancyResource::make($this->whenLoaded('tenancy')),
            'rent_bill' => RentBillResource::make($this->whenLoaded('rentBill')),
        ];
    }
}
