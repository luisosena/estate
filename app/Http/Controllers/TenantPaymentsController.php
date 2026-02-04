<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantPaymentsController extends Controller
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

    return Inertia::render('tenant/payments', [
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
