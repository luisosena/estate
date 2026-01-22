<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Tenant;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/landlorddashboard', function () {
    return Inertia::render('landlordDashboard');
})->name('landlord.dashboard');

Route::get('/mail', function () {
    return Inertia::render('mail');
})->name('mail');

Route::get('/tenant/{id}', function ($id){
    $tenant = Tenant::findOrFail($id);
    return Inertia::render('tenantDashboard', [
        'tenant' => $tenant
    ]);
})->name('tenant.dashboard');

Route::middleware(['auth', 'verified'])->group      (function () {
    Route::get('dashboard', function () {
        $tenants = Tenant::query()->orderBy('name')->get();

        return Inertia::render('dashboard', [
            'tenants' => $tenants,
        ]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
