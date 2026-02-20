<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TenantUtilitiesController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();
    $tenant = $user->tenant;

    return Inertia::render('tenant/utilities', [
      'tenant' => [
        'id' => $tenant->id,
        'full_name' => $tenant->full_name
      ]
    ]);
  }
}
