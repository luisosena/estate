<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Tenant;
use App\Http\Controllers\Web\Tenant\TenantDashboardController;
use App\Http\Controllers\Web\Tenant\TenantPaymentsController;
use App\Http\Controllers\Web\Tenant\TenantUtilitiesController;
use App\Http\Controllers\Web\Tenant\TenantNotificationController;
use App\Http\Controllers\Web\Admin\AdminDashboardController;
use App\Http\Controllers\Web\Admin\AdminPropertyController;
use App\Http\Controllers\Web\Admin\AdminUserController;
use App\Http\Controllers\Web\Landlord\LandlordDashboardController;
use App\Http\Controllers\Web\Landlord\LandlordPropertyController;
use App\Http\Controllers\Web\Landlord\LandlordTenantController;
use App\Http\Controllers\Web\Landlord\LandlordUnitController;
use App\Http\Controllers\Web\Landlord\LandlordNotificationController;
use App\Http\Controllers\Web\Landlord\LandlordPaymentController;
use App\Http\Controllers\Web\Landlord\LandlordUtilityController;
use App\Http\Controllers\Web\Landlord\LandlordUtilityBillController;
use App\Http\Controllers\Web\Landlord\LandlordRentBillController;
use App\Http\Controllers\Web\Tenant\TenantRentBillController;

Route::get('/', function () {
    return Inertia::render('website/home');
})->name('home');

// Keep welcome as a fallback route for now
Route::get('/welcome', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');


Route::middleware(['auth'])->group(function () {
    //Admin Routes
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    // Admin Property Management Routes
    Route::get('/admin/properties', [AdminPropertyController::class, 'index'])
        ->name('admin.properties.index');

    Route::get('/admin/properties/create', [AdminPropertyController::class, 'create'])
        ->name('admin.properties.create');

    Route::post('/admin/properties', [AdminPropertyController::class, 'store'])
        ->name('admin.properties.store');

    Route::get('/admin/properties/{property}', [AdminPropertyController::class, 'show'])
        ->name('admin.properties.show');

    Route::get('/admin/properties/{property}/edit', [AdminPropertyController::class, 'edit'])
        ->name('admin.properties.edit');

    Route::put('/admin/properties/{property}', [AdminPropertyController::class, 'update'])
        ->name('admin.properties.update');

    Route::delete('/admin/properties/{property}', [AdminPropertyController::class, 'destroy'])
        ->name('admin.properties.destroy');

    Route::get('/admin/properties/stats', [AdminPropertyController::class, 'stats'])
        ->name('admin.properties.stats');

    // Admin User Management Routes
    Route::get('/admin/users', [AdminUserController::class, 'index'])
        ->name('admin.users.index');

    Route::get('/admin/users/create', [AdminUserController::class, 'create'])
        ->name('admin.users.create');

    Route::post('/admin/users', [AdminUserController::class, 'store'])
        ->name('admin.users.store');

    Route::get('/admin/users/{landlord}', [AdminUserController::class, 'show'])
        ->name('admin.users.show');

    Route::get('/admin/users/{landlord}/edit', [AdminUserController::class, 'edit'])
        ->name('admin.users.edit');

    Route::put('/admin/users/{landlord}', [AdminUserController::class, 'update'])
        ->name('admin.users.update');

    Route::delete('/admin/users/{landlord}', [AdminUserController::class, 'destroy'])
        ->name('admin.users.destroy');

    Route::post('/admin/users/{landlord}/toggle-status', [AdminUserController::class, 'toggleStatus'])
        ->name('admin.users.toggle-status');

    //Landlord Routes
    Route::get('/landlord/dashboard', [LandlordDashboardController::class, 'index'])
        ->name('landlord.dashboard');

    Route::get('/landlord/properties', [LandlordPropertyController::class, 'index'])
        ->name('landlord.properties.index');

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

    Route::put('/landlord/tenancies/{tenancy}/change-unit', [LandlordTenantController::class, 'changeUnit'])
        ->name('landlord.tenancies.change-unit');

    Route::put('/landlord/tenancies/{tenancy}/end', [LandlordTenantController::class, 'endTenancy'])
        ->name('landlord.tenancies.end');

    // Payment Management Routes
    Route::get('/landlord/payments', [LandlordPaymentController::class, 'index'])
        ->name('landlord.payments.index');

    Route::post('/landlord/tenants/{tenant}/payments', [LandlordPaymentController::class, 'store'])
        ->name('landlord.tenants.payments.store');

    Route::put('/landlord/payments/{payment}', [LandlordPaymentController::class, 'update'])
        ->name('landlord.payments.update');

    Route::delete('/landlord/payments/{payment}', [LandlordPaymentController::class, 'destroy'])
        ->name('landlord.payments.destroy');

    // Unit Management Routes
    Route::get('/landlord/units/create', [LandlordUnitController::class, 'create'])
        ->name('landlord.units.create');

    Route::post('/landlord/units', [LandlordUnitController::class, 'store'])
        ->name('landlord.units.store');

    Route::get('/landlord/units', [LandlordUnitController::class, 'index'])
        ->name('landlord.units.index');

    Route::get('/landlord/units/{unit}', [LandlordUnitController::class, 'show'])
        ->name('landlord.units.show');

    Route::get('/landlord/properties/{property}/units', [LandlordUnitController::class, 'byProperty'])
        ->name('landlord.properties.units');

    // Notification Management Routes
    Route::get('/landlord/notifications', [LandlordNotificationController::class, 'index'])
        ->name('landlord.notifications.index');

    Route::put('/landlord/notifications/{id}/read', [LandlordNotificationController::class, 'markAsRead'])
        ->name('landlord.notifications.read');

    Route::put('/landlord/notifications/{id}/unread', [LandlordNotificationController::class, 'markAsUnread'])
        ->name('landlord.notifications.unread');

    Route::put('/landlord/notifications/read-all', [LandlordNotificationController::class, 'markAllAsRead'])
        ->name('landlord.notifications.read-all');

    Route::delete('/landlord/notifications/{id}', [LandlordNotificationController::class, 'destroy'])
        ->name('landlord.notifications.destroy');

    // API Routes for notifications
    Route::get('/landlord/notifications/unread-count', [LandlordNotificationController::class, 'unreadCount'])
        ->name('landlord.notifications.unread-count');

    Route::get('/landlord/notifications/recent', [LandlordNotificationController::class, 'recent'])
        ->name('landlord.notifications.recent');

    // Landlord Utility Management Routes
    // IMPORTANT: index route must come BEFORE parameterized routes
    Route::get('/landlord/utilities', [LandlordUtilityController::class, 'index'])
        ->name('landlord.utilities.index');

    Route::get('/landlord/tenancies/{tenancy}/utilities/create', [LandlordUtilityController::class, 'create'])
        ->name('landlord.utilities.create');

    Route::post('/landlord/tenancies/{tenancy}/utilities', [LandlordUtilityController::class, 'store'])
        ->name('landlord.utilities.store');

    // Show route must come AFTER index to avoid "utilities" being matched as tenancy ID
    Route::get('/landlord/utilities/{tenancy}', [LandlordUtilityController::class, 'show'])
        ->name('landlord.utilities.show');

    Route::get('/landlord/tenancy-utilities/{tenancyUtility}/edit', [LandlordUtilityController::class, 'edit'])
        ->name('landlord.utilities.edit');

    Route::put('/landlord/tenancy-utilities/{tenancyUtility}', [LandlordUtilityController::class, 'update'])
        ->name('landlord.utilities.update');

    Route::delete('/landlord/tenancy-utilities/{tenancyUtility}', [LandlordUtilityController::class, 'destroy'])
        ->name('landlord.utilities.destroy');

    // Landlord Utility Bills Routes
    // IMPORTANT: index route must come BEFORE parameterized routes
    Route::get('/landlord/utility-bills', [LandlordUtilityBillController::class, 'index'])
        ->name('landlord.utility-bills.index');

    Route::get('/landlord/utility-bills/{utilityBill}', [LandlordUtilityBillController::class, 'show'])
        ->name('landlord.utility-bills.show');

    Route::post('/landlord/utility-bills/{utilityBill}/waive', [LandlordUtilityBillController::class, 'waive'])
        ->name('landlord.utility-bills.waive');

    // Landlord Rent Bills Routes
    Route::get('/landlord/rent-bills', [LandlordRentBillController::class, 'index'])
        ->name('landlord.rent-bills.index');

    Route::get('/landlord/rent-bills/{rentBill}', [LandlordRentBillController::class, 'show'])
        ->name('landlord.rent-bills.show');

    Route::post('/landlord/rent-bills/{rentBill}/waive', [LandlordRentBillController::class, 'waive'])
        ->name('landlord.rent-bills.waive');

    //Tenant Routes
    Route::get('/tenant/dashboard', [TenantDashboardController::class, 'index'])
        ->name('tenant.dashboard');

    
    Route::get('/tenant/payments', [TenantPaymentsController::class, 'index'])
        ->name('tenant.payments');

    Route::get('/tenant/payments/make', [TenantPaymentsController::class, 'makePayment'])
        ->name('tenant.payments.make');

    Route::post('/tenant/payments', [TenantPaymentsController::class, 'storePayment'])
        ->name('tenant.payments.store')
        ->middleware('throttle:5,1');

    Route::patch('/tenant/payments/{payment}', [TenantPaymentsController::class, 'storePayment'])
        ->name('tenant.payments.update')
        ->middleware('throttle:5,1');

    Route::get('/tenant/utilities', [TenantUtilitiesController::class, 'index'])
        ->name('tenant.utilities');

    Route::get('/tenant/utilities/bills', [TenantUtilitiesController::class, 'bills'])
        ->name('tenant.utilities.bills');

    // Tenant Rent Bills Routes
    Route::get('/tenant/rent-bills', [TenantRentBillController::class, 'index'])
        ->name('tenant.rent-bills.index');

    Route::get('/tenant/rent-bills/{rentBill}', [TenantRentBillController::class, 'show'])
        ->name('tenant.rent-bills.show');

    // Tenant Notification Management Routes
    Route::get('/tenant/notifications', [TenantNotificationController::class, 'index'])
        ->name('tenant.notifications.index');

    Route::put('/tenant/notifications/{id}/read', [TenantNotificationController::class, 'markAsRead'])
        ->name('tenant.notifications.read');

    Route::put('/tenant/notifications/{id}/unread', [TenantNotificationController::class, 'markAsUnread'])
        ->name('tenant.notifications.unread');

    Route::put('/tenant/notifications/read-all', [TenantNotificationController::class, 'markAllAsRead'])
        ->name('tenant.notifications.read-all');

    Route::delete('/tenant/notifications/{id}', [TenantNotificationController::class, 'destroy'])
        ->name('tenant.notifications.destroy');

    // API Routes for tenant notifications
    Route::get('/tenant/notifications/unread-count', [TenantNotificationController::class, 'unreadCount'])
        ->name('tenant.notifications.unread-count');

    Route::get('/tenant/notifications/recent', [TenantNotificationController::class, 'recent'])
        ->name('tenant.notifications.recent');
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
