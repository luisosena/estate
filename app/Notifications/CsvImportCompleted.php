<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use App\Models\CsvImportBatch;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CsvImportCompleted extends Notification
{
    use Queueable;

    public function __construct(
        public readonly CsvImportBatch $batch,
        public readonly User $landlord,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', BroadcastChannel::class];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $isAdmin = $notifiable->role->value === 'admin';

        $message = $isAdmin
            ? "Landlord {$this->landlord->name} completed a bulk import of "
              ."\"{$this->batch->original_filename}\". "
              ."{$this->batch->created_rows} records created, "
              ."{$this->batch->failed_rows} failed."
            : "Your import of \"{$this->batch->original_filename}\" is complete. "
              ."{$this->batch->created_rows} records created"
              .($this->batch->failed_rows > 0
                  ? ", {$this->batch->failed_rows} rows could not be imported."
                  : '.');

        return [
            'title' => 'Bulk Import Complete',
            'message' => $message,
            'batch_id' => $this->batch->id,
            'priority' => 'normal',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
