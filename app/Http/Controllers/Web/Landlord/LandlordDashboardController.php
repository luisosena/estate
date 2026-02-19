<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('landlord/dashboard');
    }
}