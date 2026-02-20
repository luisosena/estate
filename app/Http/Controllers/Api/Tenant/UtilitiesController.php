<?php

namespace App\Http\Controllers\Api\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UtilitiesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name
            ]
        ]);
    }
}
