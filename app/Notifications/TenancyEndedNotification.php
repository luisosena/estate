<?php

namespace App\Notifications;

use App\Models\Tenancy;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class TenancyEndedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Tenancy $tenancy,
        public bool $isForTenant = false
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
    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        $message = new \Illuminate\Notifications\Messages\MailMessage();
        
        if ($this->isForTenant) {
            return $message
                ->subject("Your Tenancy Has Ended - {$this->tenancy->unit->property->name}")
                ->greeting("Dear {$this->tenancy->tenant->full_name},")
                ->line("This is to confirm that your tenancy at {$this->tenancy->unit->property->name} has officially ended.")
                ->line("")
                ->line("**Tenancy Details:**")
                ->line("• Property: {$this->tenancy->unit->property->name}")
                ->line("• Unit: {$this->tenancy->unit->unit_name} ({$this->tenancy->unit->unit_code})")
                ->line("• End Date: {$this->tenancy->move_out_date}")
                ->line("• Status: Ended")
                ->line("")
                ->line("**Important Next Steps:**")
                ->line("• Ensure all personal belongings have been removed from the property")
                ->line("• Return keys to the landlord or property manager")
                ->line("• Update your address with all relevant services and institutions")
                ->line("• Discuss security deposit return with your landlord")
                ->line("")
                ->line("Thank you for choosing {$this->tenancy->unit->property->name}. We wish you the best in your future housing arrangements.");
        }

        // Landlord notification
        return $message
            ->subject("Tenancy Automatically Ended - {$this->tenancy->tenant->full_name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("The tenancy for {$this->tenancy->tenant->full_name} ({$this->tenancy->tenant->tenant_code}) has been automatically ended.")
            ->line("")
            ->line("**Tenancy Details:**")
            ->line("• Tenant: {$this->tenancy->tenant->full_name} ({$this->tenancy->tenant->tenant_code})")
            ->line("• Property: {$this->tenancy->unit->property->name}")
            ->line("• Unit: {$this->tenancy->unit->unit_name} ({$this->tenancy->unit->unit_code})")
            ->line("• End Date: {$this->tenancy->move_out_date}")
            ->line("• Status: Automatically Ended")
            ->line("")
            ->line("**Actions Taken:**")
            ->line("✓ Tenancy status changed to 'ended'")
            ->line("✓ Unit status updated to 'available'")
            ->line("✓ End reason set to 'automatic_expiry'")
            ->line("")
            ->action(
                'View Tenant Details',
                url("/landlord/tenants/{$this->tenancy->tenant->tenant_code}")
            )
            ->line("The unit is now available for new tenants. You may want to list it for rent or prepare it for the next tenant.");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->isForTenant 
                ? "Your Tenancy Has Ended"
                : "Tenancy Automatically Ended - {$this->tenancy->tenant->full_name}",
            'message' => $this->isForTenant
                ? "Your tenancy at {$this->tenancy->unit->property->name} has officially ended."
                : "The tenancy for {$this->tenancy->tenant->full_name} has been automatically ended.",
            'tenancy_id' => $this->tenancy->id,
            'tenant_id' => $this->tenancy->tenant_id,
            'unit_id' => $this->tenancy->unit_id,
            'property_id' => $this->tenancy->unit->property_id,
            'end_date' => $this->tenancy->move_out_date,
            'is_for_tenant' => $this->isForTenant,
            'priority' => 'high',
        ];
    }
}
