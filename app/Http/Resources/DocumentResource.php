<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'category' => $this->category,
            'download_url' => $this->when(
                $request->routeIs('api.*') || $request->is('api/*'),
                url('/api/v1/landlord/documents/'.$this->id.'/download')
            ),
            'uploaded_at' => $this->uploaded_at?->toDateTimeString(),
            'uploaded_by' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
        ];
    }
}
