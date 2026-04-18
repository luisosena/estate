<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this can be a User (landlord) or a Property model
        $type = $this->resource instanceof User ? 'landlord_registration' : 'property_registration';

        return [
            'id' => $this->id,
            'type' => $type,
            'title' => $this->getTitle($type),
            'description' => $this->getDescription($type),
            'time' => $this->created_at?->diffForHumans(),
            'icon' => $this->getIcon($type),
            'created_at' => $this->created_at?->toDateTimeString(),
            'payload' => $this->getPayload($type),
        ];
    }

    protected function getTitle(string $type): string
    {
        return $type === 'landlord_registration' ? 'New Landlord Registered' : 'Property Added';
    }

    protected function getDescription(string $type): string
    {
        if ($type === 'landlord_registration') {
            return $this->name.' joined the platform.';
        }

        return $this->name.' was registered by '.($this->landlord->name ?? 'Unknown').'.';
    }

    protected function getIcon(string $type): string
    {
        return $type === 'landlord_registration' ? 'users' : 'building';
    }

    protected function getPayload(string $type): array
    {
        if ($type === 'landlord_registration') {
            return (new LandlordResource($this->resource))->resolve();
        }

        return (new PropertyResource($this->resource))->resolve();
    }
}
