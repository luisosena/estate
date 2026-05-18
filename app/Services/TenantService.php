<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    /**
     * Get dashboard data for a specific tenant.
     */
    public function getTenantDashboardData(Tenant $tenant): array
    {
        $activeTenancy = $this->getActiveTenancy($tenant);

        return [
            'tenant' => $tenant,
            'unit' => $activeTenancy?->unit,
            'tenancy' => $activeTenancy ? [
                'id' => $activeTenancy->id,
                'move_in_date' => $activeTenancy->move_in_date,
                'status' => $activeTenancy->status,
                'monthly_rent' => $activeTenancy->monthly_rent,
                'security_deposit' => $activeTenancy->security_deposit,
            ] : null,
            'payments' => $activeTenancy?->payments()
                ->orderByDesc('paid_at')
                ->limit(5)
                ->get()
                ->toArray() ?? [],
            'utilities' => $activeTenancy?->tenancyUtilities
                ? $activeTenancy->tenancyUtilities->toArray()
                : [],
            'notifications' => $tenant->notifications()
                ->latest()
                ->take(5)
                ->get(),
            'rent_bills' => $activeTenancy?->rentBills()->latest('billing_month')->take(6)->get() ?? [],
            'current_month_bill' => $activeTenancy?->rentBills()->where('billing_month', '>=', now()->startOfMonth())->first(),
        ];
    }

    /**
     * Get the currently active tenancy for a tenant.
     */
    public function getActiveTenancy(Tenant $tenant): ?Tenancy
    {
        return $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'payments.tenant', 'payments.utilityBill.tenancyUtility.utilityType', 'tenancyUtilities.utilityType'])
            ->first();
    }

    /**
     * Create a tenant, user account, and optional tenancy in one atomic action.
     */
    public function createTenantWithTenancy(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create Tenant
            $tenant = Tenant::create([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'emergency_contact_relation' => $data['emergency_contact_relation'] ?? null,
            ]);

            // 2. Create User Account
            $username = $this->generateUniqueUsername($tenant->full_name);
            $tempPassword = Str::random(12);

            $user = User::create([
                'name' => $tenant->full_name,
                'username' => $username,
                'email' => $tenant->email,
                'password' => $tempPassword,
                'role' => Role::Tenant->value,
                'tenant_id' => $tenant->id,
                'must_change_password' => true,
            ]);

            // 3. Handle Tenancy (if unit_id provided)
            $tenancy = null;
            if (! empty($data['unit_id'])) {
                $tenancy = Tenancy::create([
                    'tenant_id' => $tenant->id,
                    'unit_id' => $data['unit_id'],
                    'move_in_date' => $data['move_in_date'],
                    'monthly_rent' => $data['monthly_rent'],
                    'security_deposit' => $data['security_deposit'],
                    'rent_due_day' => $data['rent_due_day'] ?? 5,
                    'status' => 'active',
                ]);

                // Update unit status
                Unit::where('id', $data['unit_id'])->update(['status' => 'occupied']);

                // Handle tenancy agreement upload if present
                if (isset($data['tenancy_agreement']) && $data['tenancy_agreement'] instanceof UploadedFile) {
                    $this->documentService->upload(
                        $data['tenancy_agreement'],
                        $tenancy,
                        'tenancy_agreement',
                        auth()->user()
                    );
                }

                $tenancy->load('tenant');
            }

            return [
                'tenant' => $tenant,
                'tenancy' => $tenancy,
                'user' => $user,
                'credentials' => [
                    'username' => $username,
                    'password' => $tempPassword,
                ],
            ];
        });
    }

    /**
     * Generate a unique username based on the full name.
     */
    private function generateUniqueUsername(string $fullName): string
    {
        do {
            $nameParts = explode(' ', trim($fullName));
            $base = strtolower(implode('.', array_slice($nameParts, 0, 3)));
            $username = $base.rand(100, 999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}
