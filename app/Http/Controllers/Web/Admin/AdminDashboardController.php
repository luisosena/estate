<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\Role;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(protected AdminDashboardService $service) {}

    public function index(Request $request)
    {
        if (! $request->user() || $request->user()->role !== Role::Admin) {
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        return Inertia::render('admin/dashboard', $this->service->getDashboardData());
    }
}
