<?php

namespace App\Http\Controllers\Api\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\UtilityService;

class UtilitiesController extends Controller
{
    protected UtilityService $utilityService;

    public function __construct(UtilityService $utilityService)
    {
        $this->utilityService = $utilityService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $utilities = $this->utilityService->getTenantUtilities($tenant);

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name
            ],
            'utilities' => $utilities->map(function ($utility) {
                return [
                    'id' => $utility->id,
                    'type' => $utility->type,
                    'amount' => $utility->amount,
                    'due_date' => $utility->due_date,
                    'status' => $utility->status,
                    'reading' => $utility->reading,
                    'period' => $utility->billing_period,
                ];
            })
        ]);
    }
}
