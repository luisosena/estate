<?php

namespace App\Http\Controllers\Web\Admin;

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
        if (! $request->user() || $request->user()->role !== 'admin') {
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        return Inertia::render('admin/dashboard', $this->service->getDashboardData());
    }

    /**
     * Display the admin's notifications (placeholder).
     */
    public function notifications(Request $request)
    {
        return Inertia::render('admin/notifications/index', [
            'notifications' => [
                'data' => [],
                'total' => 0,
            ],
            'unreadCount' => 0,
        ]);
    }
}
