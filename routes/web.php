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
use App\Http\Controllers\Web\Landlord\LandlordTenantController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');


Route::middleware(['auth'])->group(function () {
    //Admin Routes
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    //Landlord Routes
    Route::get('/landlord/dashboard', [LandlordDashboardController::class, 'index'])
        ->name('landlord.dashboard');

    Route::get('/landlord/tenants/create', [LandlordTenantController::class, 'create'])
        ->name('landlord.tenants.create');
        
    Route::post('/landlord/tenants', [LandlordTenantController::class, 'store'])
        ->name('landlord.tenants.store');

    // Landlord tenant management routes
    Route::get('/landlord/tenants', [LandlordTenantController::class, 'index'])
        ->name('landlord.tenants.index');

    Route::get('/landlord/properties/{property}/tenants', [LandlordTenantController::class, 'byProperty'])
        ->name('landlord.properties.tenants');

    Route::delete('/landlord/tenants/{tenancy}/remove', [LandlordTenantController::class, 'removeTenant'])
        ->name('landlord.tenants.remove');

    Route::get('/landlord/tenants/{tenant}', [LandlordTenantController::class, 'show'])
        ->name('landlord.tenants.show')
        ->where('tenant', '[A-Z0-9\-]+');

    Route::put('/landlord/tenants/{tenant}', [LandlordTenantController::class, 'update'])
        ->name('landlord.tenants.update');

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
