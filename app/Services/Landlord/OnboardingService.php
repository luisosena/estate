<?php

namespace App\Services\Landlord;

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;

class OnboardingService
{
    /**
     * Handle the onboarding of a new tenant and creation of their tenancy.
     */
    public function onboard(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create or Find Tenant
            $tenant = Tenant::updateOrCreate(
                ['email' => $data['email'], 'phone' => $data['phone']],
                [
                    'full_name' => $data['full_name'],
                    // tenant_code is handled by the model's booted method,
                    // but we ensure it's provided if for some reason we need a custom one.
                ]
            );

            // 2. Create Tenancy
            $tenancy = Tenancy::create([
                'tenant_id' => $tenant->id,
                'unit_id' => $data['unit_id'],
                'move_in_date' => $data['move_in_date'],
                'monthly_rent' => $data['monthly_rent'],
                'security_deposit' => $data['security_deposit'] ?? 0,
                'status' => 'active',
            ]);

            // 3. Mark unit as occupied
            Unit::where('id', $data['unit_id'])->update(['status' => 'occupied']);

            return [
                'tenant' => $tenant,
                'tenancy' => $tenancy,
            ];
        });
    }
}
