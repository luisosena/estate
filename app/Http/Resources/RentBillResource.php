<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentBillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenancy_id' => $this->tenancy_id,
            'billing_month' => $this->billing_month ? $this->billing_month->format('Y-m') : null,
            'amount_due' => $this->amount_due,
            'amount_paid' => $this->amount_paid,
            'balance' => $this->balance,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
