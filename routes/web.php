<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Tenant;
use App\Http\Controllers\TenantDashboardController;
use App\Http\Controllers\TenantPaymentsController;
use App\Http\Controllers\TenantUtilitiesController;


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/landlorddashboard', function () {
    return Inertia::render('landlordDashboard');
})->name('landlord.dashboard');

Route::get('/testdashboard', function () {
    return Inertia::render('testDashboard');
})->name('testdashboard');

Route::get('/mail', function () {
    return Inertia::render('mail');
})->name('mail');

/*
Route::post('/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');
*/

/*
Route::get('/tenant/{id}', function ($id){
    $tenant = Tenant::findOrFail($id);
    return Inertia::render('tenant/dashboard', [
        'tenant' => $tenant
    ]);
})->name('tenant.dashboard');
*/
/*
Route::middleware(['auth'])->group(function () {
    Route::get('/tenant/dashboard', [TenantDashboardController::class, 'index'])
        ->name('tenant.dashboard');
});
*/


Route::get('/tenant/dashboard', [TenantDashboardController::class, 'index'])
    ->name('tenant.dashboard');

Route::get('/tenant/payments', [TenantPaymentsController::class, 'index'])
    ->name('tenant.payments');

Route::get('/tentant/utilities', [TenantUtilitiesController::class, 'index'])
    ->name('tenant.utilities');

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

/*
Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');
*/

/*
Route::middleware(['auth', 'verified'])->group      (function () {
    Route::get('dashboard', function () {
        $tenants = Tenant::query()->orderBy('name')->get();

        return Inertia::render('dashboard', [
            'tenants' => $tenants,
        ]);
    })->name('dashboard');

});
*/

require __DIR__ . '/settings.php';
