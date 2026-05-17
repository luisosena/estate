<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use App\Models\Tenancy;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TenancyEndedWithBalance extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Tenancy $tenancy,
        public float $outstandingBalance
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', BroadcastChannel::class];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => "Tenancy Ended with Outstanding Balance - {$this->tenancy->tenant->full_name}",
            'message' => "The tenancy for {$this->tenancy->tenant->full_name} has ended, but there is an outstanding balance of ".number_format($this->outstandingBalance, 2).' TZS.',
            'tenancy_id' => $this->tenancy->id,
            'tenant_id' => $this->tenancy->tenant_id,
            'outstanding_balance' => $this->outstandingBalance,
            'priority' => 'high',
        ];
    }
}
