<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
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
            'tenant_code' => $this->tenant_code,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'created_at' => $this->created_at?->toDateTimeString(),
            // Computed fields often returned in lists
            'tenancy_id' => $this->when(isset($this->tenancy_id), $this->tenancy_id),
            'tenancy_status' => $this->when(isset($this->tenancy_status), $this->tenancy_status),
            'unit_name' => $this->when(isset($this->unit_name), $this->unit_name),
            'unit_code' => $this->when(isset($this->unit_code), $this->unit_code),
            'property_name' => $this->when(isset($this->property_name), $this->property_name),
            'property_id' => $this->when(isset($this->property_id), $this->property_id),
            // User account if exists
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
