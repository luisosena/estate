<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
