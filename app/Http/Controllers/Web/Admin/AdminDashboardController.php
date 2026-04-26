<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\Role;

use App\Http\Resources\NotificationResource;
use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(protected AdminDashboardService $service) {}

    public function index(Request $request)
    {
        // Admin authorization check (Alternative to middleware)
        if (! $request->user() || $request->user()->role !== Role::Admin) {
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        return Inertia::render('admin/dashboard', $this->service->getDashboardData());
    }

    /**
     * Display the admin's notifications.
     */
    public function notifications(Request $request)
    {
        return Inertia::render('admin/notifications/index', [
            'notifications' => NotificationResource::collection(collect([])),
            'unreadCount' => 0,
        ]);
    }
}
