<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Tenant;
use App\Http\Controllers\Web\Tenant\TenantDashboardController;
use App\Http\Controllers\Web\Tenant\TenantPaymentsController;
use App\Http\Controllers\Web\Tenant\TenantUtilitiesController;
use App\Http\Controllers\Web\Admin\AdminDashboardController;
use App\Http\Controllers\Web\Landlord\LandlordDashboardController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');

//Admin Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::get('/landlord/dashboard', [LandlordDashboardController::class, 'index'])
        ->name('landlord.dashboard');

    //Tenant Routes
    Route::get('/tenant/dashboard', [TenantDashboardController::class, 'index'])
        ->name('tenant.dashboard');

    Route::get('/tenant/payments', [TenantPaymentsController::class, 'index'])
        ->name('tenant.payments');

    Route::get('/tenant/utilities', [TenantUtilitiesController::class, 'index'])
        ->name('tenant.utilities');
});

Route::get('/mail', function () {
    return Inertia::render('mail');
})->name('mail');

Route::get('/tests', function () {
    return Inertia::render('tests');
})->name('tests');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

Route::get('/tests2', function () {
    $tenants = Tenant::query()->orderBy('id')->get();
    return Inertia::render('tests2', [
        'tenants' => $tenants,
    ]);
})->name('tests2');

require __DIR__ . '/settings.php';
