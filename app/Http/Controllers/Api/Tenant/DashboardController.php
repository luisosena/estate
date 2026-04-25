<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected TenantService $tenantService) {}

    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->role !== 'tenant' || ! $user->tenant) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $data = $this->tenantService->getTenantDashboardData($user->tenant);

            return response()->json([
                'data' => [
                    'tenant' => [
                        'id' => $data['tenant']->id,
                        'full_name' => $data['tenant']->full_name,
                        'phone' => $data['tenant']->phone,
                        'email' => $data['tenant']->email,
                        'is_active' => true,
                    ],

                    'unit' => $data['unit'] ? [
                        'id' => $data['unit']->id,
                        'unit_name' => $data['unit']->unit_name,
                        'unit_code' => $data['unit']->unit_code,
                        'property' => $data['unit']->property ? [
                            'id' => $data['unit']->property->id,
                            'name' => $data['unit']->property->name,
                        ] : null,
                    ] : null,

                    'tenancy' => $data['tenancy'] ? [
                        'id' => $data['tenancy']['id'],
                        'unit_id' => $data['unit']?->id,
                        'move_in_date' => $data['tenancy']['move_in_date'],
                        'status' => $data['tenancy']['status'],
                        'monthly_rent' => $data['tenancy']['monthly_rent'],
                        'security_deposit' => $data['tenancy']['security_deposit'],
                    ] : null,

                    'payments' => collect($data['payments'])->map(fn ($p) => [
                        'id' => $p['id'],
                        'amount' => $p['amount'],
                        'payment_type' => $p['payment_type'],
                        'payment_method' => $p['payment_method'],
                        'status' => $p['status'],
                        'paid_at' => $p['paid_at'] ? Carbon::parse($p['paid_at'])->toIso8601String() : null,
                        'reference_number' => $p['reference_number'] ?? null,
                    ]),

                    'rent_bills' => collect($data['rent_bills'])->map(fn ($rb) => [
                        'id' => $rb->id,
                        'billing_month' => $rb->billing_month?->format('Y-m'),
                        'amount_due' => $rb->amount_due,
                        'amount_paid' => $rb->amount_paid,
                        'due_date' => $rb->due_date?->toIso8601String(),
                        'status' => $rb->status,
                    ]),

                    'current_month_bill' => $data['current_month_bill'] ? [
                        'id' => $data['current_month_bill']->id,
                        'billing_month' => $data['current_month_bill']->billing_month?->format('Y-m'),
                        'amount_due' => $data['current_month_bill']->amount_due,
                        'amount_paid' => $data['current_month_bill']->amount_paid,
                        'status' => $data['current_month_bill']->status,
                    ] : null,

                    'utilities' => $data['utilities'],
                    'notifications' => $data['notifications'],
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Api DashboardController error: '.$e->getMessage());

            return response()->json([
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ], 500);
        }
    }
}
