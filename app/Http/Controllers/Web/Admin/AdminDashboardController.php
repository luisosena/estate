<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return redirect()->route('login');
            }
        } catch (\Exception $e) {
        
            \Log::error('Admin dashboard error: ' . $e->getMessage());
        }


        return Inertia::render('admin/dashboard');
    }
}