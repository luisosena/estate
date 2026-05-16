<?php

use App\Enums\Role;
use App\Http\Controllers\Web\Admin\AdminDashboardController;
use App\Http\Controllers\Web\Admin\AdminLandlordController;
use App\Http\Controllers\Web\Admin\AdminPropertyController;
use App\Http\Controllers\Web\Landlord\DocumentController as LandlordDocumentController;
use App\Http\Controllers\Web\Landlord\LandlordDashboardController;
use App\Http\Controllers\Web\Landlord\LandlordNotificationController;
use App\Http\Controllers\Web\Landlord\LandlordPaymentController;
use App\Http\Controllers\Web\Landlord\LandlordPropertyController;
use App\Http\Controllers\Web\Landlord\LandlordRentBillController;
use App\Http\Controllers\Web\Landlord\LandlordTenantController;
use App\Http\Controllers\Web\Landlord\LandlordUnitController;
use App\Http\Controllers\Web\Landlord\LandlordUtilityBillController;
use App\Http\Controllers\Web\Landlord\LandlordUtilityController;
use App\Http\Controllers\Web\Tenant\DocumentController as TenantDocumentController;
use App\Http\Controllers\Web\Tenant\TenantDashboardController;
use App\Http\Controllers\Web\Tenant\TenantNotificationController;
use App\Http\Controllers\Web\Tenant\TenantPaymentsController;
use App\Http\Controllers\Web\Tenant\TenantRentBillController;
use App\Http\Controllers\Web\Tenant\TenantUtilitiesController;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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
    // Admin Routes
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::get('/admin/notifications', [AdminDashboardController::class, 'notifications'])
        ->name('admin.notifications.index');

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

    // Admin Landlord Management Routes
    Route::get('/admin/landlords', [AdminLandlordController::class, 'index'])
        ->name('admin.landlords.index');

    Route::get('/admin/landlords/create', [AdminLandlordController::class, 'create'])
        ->name('admin.landlords.create');

    Route::post('/admin/landlords', [AdminLandlordController::class, 'store'])
        ->name('admin.landlords.store');

    Route::get('/admin/landlords/{landlord}', [AdminLandlordController::class, 'show'])
        ->name('admin.landlords.show');

    Route::get('/admin/landlords/{landlord}/edit', [AdminLandlordController::class, 'edit'])
        ->name('admin.landlords.edit');

    Route::put('/admin/landlords/{landlord}', [AdminLandlordController::class, 'update'])
        ->name('admin.landlords.update');

    Route::delete('/admin/landlords/{landlord}', [AdminLandlordController::class, 'destroy'])
        ->name('admin.landlords.destroy');

    Route::post('/admin/landlords/{landlord}/toggle-status', [AdminLandlordController::class, 'toggleStatus'])
        ->name('admin.landlords.toggle-status');

    // Landlord Routes
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

    // Landlord Document Management Routes
    Route::post('/landlord/tenancies/{tenancy}/documents', [LandlordDocumentController::class, 'store'])
        ->name('landlord.tenancies.documents.store');
    Route::get('/landlord/documents/{document}/download', [LandlordDocumentController::class, 'download'])
        ->name('landlord.documents.download');
    Route::delete('/landlord/documents/{document}', [LandlordDocumentController::class, 'destroy'])
        ->name('landlord.documents.destroy');

    // Payment Management Routes
    Route::get('/landlord/payments', [LandlordPaymentController::class, 'index'])
        ->name('landlord.payments.index');

    Route::post('/landlord/tenants/{tenant}/payments', [LandlordPaymentController::class, 'store'])
        ->name('landlord.tenants.payments.store');

    Route::put('/landlord/payments/{payment}', [LandlordPaymentController::class, 'update'])
        ->name('landlord.payments.update');

    Route::delete('/landlord/payments/{payment}', [LandlordPaymentController::class, 'destroy'])
        ->name('landlord.payments.destroy');

    Route::get('/landlord/payments/{paymentId}/receipt', [LandlordPaymentController::class, 'receipt'])
        ->name('landlord.payments.receipt')
        ->middleware('throttle:10,1');

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

    Route::put('/landlord/notifications/{notification}/read', [LandlordNotificationController::class, 'markAsRead'])
        ->name('landlord.notifications.read');

    Route::put('/landlord/notifications/{notification}/unread', [LandlordNotificationController::class, 'markAsUnread'])
        ->name('landlord.notifications.unread');

    Route::put('/landlord/notifications/read-all', [LandlordNotificationController::class, 'markAllAsRead'])
        ->name('landlord.notifications.read-all');

    Route::delete('/landlord/notifications/{notification}', [LandlordNotificationController::class, 'destroy'])
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

    // Tenant Routes
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

    Route::get('/tenant/payments/{paymentId}/receipt', [TenantPaymentsController::class, 'receipt'])
        ->name('tenant.payments.receipt')
        ->middleware('throttle:10,1');

    Route::get('/tenant/utilities', [TenantUtilitiesController::class, 'index'])
        ->name('tenant.utilities');

    Route::get('/tenant/utilities/bills', [TenantUtilitiesController::class, 'bills'])
        ->name('tenant.utilities.bills');

    // Tenant Rent Bills Routes
    Route::get('/tenant/rent-bills', [TenantRentBillController::class, 'index'])
        ->name('tenant.rent-bills.index');

    Route::get('/tenant/rent-bills/{rentBill}', [TenantRentBillController::class, 'show'])
        ->name('tenant.rent-bills.show');

    // Tenant Document Routes
    Route::get('/tenant/documents', [TenantDocumentController::class, 'index'])
        ->name('tenant.documents.index');
    Route::get('/tenant/documents/{document}/download', [TenantDocumentController::class, 'download'])
        ->name('tenant.documents.download');

    // Tenant Notification Management Routes
    Route::get('/tenant/notifications', [TenantNotificationController::class, 'index'])
        ->name('tenant.notifications.index');

    Route::put('/tenant/notifications/{notification}/read', [TenantNotificationController::class, 'markAsRead'])
        ->name('tenant.notifications.read');

    Route::put('/tenant/notifications/{notification}/unread', [TenantNotificationController::class, 'markAsUnread'])
        ->name('tenant.notifications.unread');

    Route::put('/tenant/notifications/read-all', [TenantNotificationController::class, 'markAllAsRead'])
        ->name('tenant.notifications.read-all');

    Route::delete('/tenant/notifications/{notification}', [TenantNotificationController::class, 'destroy'])
        ->name('tenant.notifications.destroy');

    // API Routes for tenant notifications
    Route::get('/tenant/notifications/unread-count', [TenantNotificationController::class, 'unreadCount'])
        ->name('tenant.notifications.unread-count');

    Route::get('/tenant/notifications/recent', [TenantNotificationController::class, 'recent'])
        ->name('tenant.notifications.recent');

    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();

        if ($user->role === Role::Admin) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === Role::Landlord) {
            return redirect()->route('landlord.dashboard');
        } else {
            return redirect()->route('tenant.dashboard');
        }
    })->name('dashboard');
});

require __DIR__.'/settings.php';
