<?php

namespace App\Http\Controllers\Api\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PaymentsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['payments'])
            ->first();

        $payments = $activeTenancy?->payments
            ->sortByDesc('paid_at')
            ->values() ?? collect();

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'payments' => $payments,
        ]);
    }
}
