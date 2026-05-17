<?php

namespace App\Listeners;

use App\Enums\Role;
use App\Models\User;
use App\Notifications\NewLandlordRegistered;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotifyAdminsOfNewLandlord implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(Registered $event): void
    {
        $user = $event->user;

        if (! $user instanceof User || $user->role !== Role::Landlord) {
            return;
        }

        $admins = User::where('role', Role::Admin)->get();

        if ($admins->isEmpty()) {
            Log::debug('No admins found to notify of new landlord registration');
            return;
        }

        foreach ($admins as $admin) {
            try {
                $admin->notify(new NewLandlordRegistered($user));
            } catch (\Exception $e) {
                Log::error('Failed to notify admin of new landlord registration', [
                    'admin_id' => $admin->id,
                    'landlord_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
