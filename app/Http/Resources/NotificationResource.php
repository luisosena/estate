<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
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
            'type' => $this->type,
            'title' => $this->data['title'] ?? 'Notification',
            'message' => $this->data['message'] ?? '',
            'priority' => $this->data['priority'] ?? 'medium',
            'action_url' => $this->data['action_url'] ?? null,
            'created_at' => $this->created_at?->toDateTimeString(),
            'read_at' => $this->read_at?->toDateTimeString(),
            'data' => $this->data,
        ];
    }
}
