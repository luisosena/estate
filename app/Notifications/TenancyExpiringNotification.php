<?php

namespace App\Notifications;

use App\Models\Tenancy;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenancyExpiringNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Tenancy $tenancy,
        public int $daysUntilExpiry,
        public bool $isForLandlord = false
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = new MailMessage;

        if ($this->isForLandlord) {
            return $message
                ->subject("Tenancy Expiring Soon - {$this->tenancy->tenant->full_name}")
                ->greeting("Hello {$notifiable->name},")
                ->line("Your tenant {$this->tenancy->tenant->full_name} ({$this->tenancy->tenant->tenant_code}) has a tenancy expiring in {$this->daysUntilExpiry} days.")
                ->line("**Property:** {$this->tenancy->unit->property->name}")
                ->line("**Unit:** {$this->tenancy->unit->unit_name} ({$this->tenancy->unit->unit_code})")
                ->line("**End Date:** {$this->tenancy->move_out_date}")
                ->line('')
                ->action(
                    'View Tenant Details',
                    url("/landlord/tenants/{$this->tenancy->tenant->tenant_code}")
                )
                ->line('Please contact the tenant to discuss renewal or move-out arrangements.');
        }

        // Tenant notification
        $subject = $this->daysUntilExpiry <= 3
            ? "URGENT: Your Tenancy Ends in {$this->daysUntilExpiry} Days"
            : "Your Tenancy Ends in {$this->daysUntilExpiry} Days";

        return $message
            ->subject($subject)
            ->greeting("Dear {$this->tenancy->tenant->full_name},")
            ->line("This is a reminder that your current tenancy will expire in {$this->daysUntilExpiry} days.")
            ->line('')
            ->line('**Property Details:**')
            ->line("• Property: {$this->tenancy->unit->property->name}")
            ->line("• Unit: {$this->tenancy->unit->unit_name} ({$this->tenancy->unit->unit_code})")
            ->line("• End Date: {$this->tenancy->move_out_date}")
            ->line('')
            ->line('**Important Actions Required:**');

        if ($this->daysUntilExpiry <= 3) {
            return $message
                ->line('• **IMMEDIATE ACTION REQUIRED** - Contact your landlord to discuss renewal or move-out plans')
                ->line('• Schedule a final inspection with your landlord')
                ->line('• Arrange for utility transfers if moving out')
                ->line('• Update your forwarding address with the landlord')
                ->line('')
                ->line('Failure to vacate by the end date may result in additional charges.');
        }

        return $message
            ->line('• Contact your landlord to discuss renewal options')
            ->line('• Schedule a walk-through inspection if you plan to move out')
            ->line('• Arrange for utility transfers if applicable')
            ->line('')
            ->line('If you have any questions or need to discuss renewal options, please contact your landlord immediately.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->isForLandlord
                ? "Tenancy Expiring Soon - {$this->tenancy->tenant->full_name}"
                : "Your Tenancy Ends in {$this->daysUntilExpiry} Days",
            'message' => $this->isForLandlord
                ? "Your tenant {$this->tenancy->tenant->full_name} has a tenancy expiring in {$this->daysUntilExpiry} days."
                : "Your tenancy will expire in {$this->daysUntilExpiry} days.",
            'tenancy_id' => $this->tenancy->id,
            'tenant_id' => $this->tenancy->tenant_id,
            'unit_id' => $this->tenancy->unit_id,
            'property_id' => $this->tenancy->unit->property_id,
            'days_until_expiry' => $this->daysUntilExpiry,
            'end_date' => $this->tenancy->move_out_date,
            'is_for_landlord' => $this->isForLandlord,
            'priority' => $this->daysUntilExpiry <= 3 ? 'high' : 'medium',
        ];
    }
}
