<?php

namespace App\Services\Landlord;

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Services\DocumentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class OnboardingService
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    public function onboard(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create or Find Tenant
            $tenant = Tenant::updateOrCreate(
                ['email' => $data['email'], 'phone' => $data['phone']],
                [
                    'full_name' => $data['full_name'],
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

            // 4. Handle tenancy agreement upload if present
            if (isset($data['tenancy_agreement']) && $data['tenancy_agreement'] instanceof UploadedFile) {
                $this->documentService->upload(
                    $data['tenancy_agreement'],
                    $tenancy,
                    'tenancy_agreement',
                    auth()->user()
                );
            }

            return [
                'tenant' => $tenant,
                'tenancy' => $tenancy,
            ];
        });
    }
}
