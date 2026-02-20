<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreTenantRequest;
use App\Models\Tenant;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('landlord/dashboard');
    }

    public function create()
    {
        return Inertia::render('landlord/tenants/create');
    }

    public function store(StoreTenantRequest $request)
    {
        $tenant = Tenant::create($request->validated());
        
        return redirect()
            ->route('landlord.dashboard')
            ->with('success', 'Tenant created successfully!');
    }
}