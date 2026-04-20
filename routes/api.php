<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\SessionController;
use App\Http\Controllers\Api\Landlord\DashboardController as LandlordDashboardController;
use App\Http\Controllers\Api\Landlord\NotificationController;
use App\Http\Controllers\Api\Landlord\PaymentController;
use App\Http\Controllers\Api\Landlord\ProfileController as LandlordProfileController;
use App\Http\Controllers\Api\Landlord\PropertyController;
use App\Http\Controllers\Api\Landlord\RentBillController;
use App\Http\Controllers\Api\Landlord\TenancyUtilityController;
use App\Http\Controllers\Api\Landlord\TenantController;
use App\Http\Controllers\Api\Landlord\UnitController;
use App\Http\Controllers\Api\Landlord\UtilityBillController;
use App\Http\Controllers\Api\Landlord\UtilityTypeController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\Tenant\DashboardController;
use App\Http\Controllers\Api\Tenant\PaymentsController;
use App\Http\Controllers\Api\Tenant\ProfileController as TenantProfileController;
use App\Http\Controllers\Api\Tenant\RentBillController as TenantRentBillController;
use App\Http\Controllers\Api\Tenant\UtilitiesController;
use App\Http\Controllers\Api\Tenant\UtilitiesController as TenantUtilitiesController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will be
| assigned to the "api" middleware group. Make something great!
|
*/

$defineApiRoutes = function (): void {
    Route::middleware('auth.api')->group(function () {
        // Authentication routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);

            // Session management - balanced rate limiting (30/min) for mobile app usage while still providing enumeration protection
            Route::middleware('throttle:30,1')->group(function () {
                Route::get('sessions', [SessionController::class, 'index']);
                Route::get('sessions/{tokenId}', [SessionController::class, 'show']);
                Route::post('sessions/{tokenId}/activity', [SessionController::class, 'updateActivity']);
                Route::delete('sessions/terminate-all', [SessionController::class, 'terminateAll']);
                Route::delete('sessions/{tokenId}', [SessionController::class, 'terminate']);
            });
        });

        // User Management (Admin/Landlord only - role check in controller)
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::post('/', [UserController::class, 'store']);
            Route::put('/{id}', [UserController::class, 'update']);
            Route::patch('/{id}', [UserController::class, 'update']);
            Route::delete('/{id}', [UserController::class, 'destroy']);
        });

        // Tenant routes
        Route::prefix('tenant')->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index']);
            Route::get('payments', [PaymentsController::class, 'index']);
            Route::middleware('throttle:10,1')->group(function () {
                Route::post('payments', [PaymentsController::class, 'store']);
            });
            Route::get('utilities', [UtilitiesController::class, 'index']);
            Route::get('utility-bills', [TenantUtilitiesController::class, 'bills']);

            // Rent Bill Management
            Route::get('rent-bills', [TenantRentBillController::class, 'index']);
            Route::get('rent-bills/current', [TenantRentBillController::class, 'current']);
            Route::get('rent-bills/{id}', [TenantRentBillController::class, 'show']);

            // Tenant Profile Management
            Route::get('profile', [TenantProfileController::class, 'show']);
            Route::put('profile', [TenantProfileController::class, 'update']);

            // Password Update (with rate limiting: 5 attempts per minute)
            Route::put('password', [PasswordController::class, 'update'])->middleware('throttle:5,1');
        });

        // Landlord routes
        Route::prefix('landlord')->group(function () {
            Route::get('dashboard', [LandlordDashboardController::class, 'index']);

            Route::get('properties', [PropertyController::class, 'index']);
            Route::get('properties/{propertyId}', [PropertyController::class, 'show']);
            Route::post('properties', [PropertyController::class, 'store']);
            Route::put('properties/{propertyId}', [PropertyController::class, 'update']);
            Route::delete('properties/{propertyId}', [PropertyController::class, 'destroy']);

            Route::get('units', [UnitController::class, 'index']);
            Route::get('units/{unitId}', [UnitController::class, 'show']);
            Route::post('units', [UnitController::class, 'store']);
            Route::put('units/{unitId}', [UnitController::class, 'update']);
            Route::delete('units/{unitId}', [UnitController::class, 'destroy']);

            Route::get('tenants', [TenantController::class, 'index']);
            Route::get('tenants/{tenantIdentifier}', [TenantController::class, 'show']);
            Route::post('tenants', [TenantController::class, 'store']);
            Route::put('tenants/{tenantIdentifier}', [TenantController::class, 'update']);
            Route::delete('tenants/{tenancyId}/remove', [TenantController::class, 'destroy']);

            Route::get('payments', [PaymentController::class, 'index']);
            Route::get('payments/{paymentId}', [PaymentController::class, 'show']);
            Route::post('payments', [PaymentController::class, 'store']);
            Route::put('payments/{paymentId}', [PaymentController::class, 'update']);
            Route::delete('payments/{paymentId}', [PaymentController::class, 'destroy']);

            Route::get('notifications', [NotificationController::class, 'index']);
            Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

            // Utility Management
            Route::get('utility-types', [UtilityTypeController::class, 'index']);
            Route::get('utility-types/{utilityType}', [UtilityTypeController::class, 'show']);

            Route::get('tenancies/{tenancy}/utilities', [TenancyUtilityController::class, 'index']);
            Route::post('tenancies/{tenancy}/utilities', [TenancyUtilityController::class, 'store']);
            Route::get('tenancy-utilities/{tenancyUtility}', [TenancyUtilityController::class, 'show']);
            Route::put('tenancy-utilities/{tenancyUtility}', [TenancyUtilityController::class, 'update']);
            Route::delete('tenancy-utilities/{tenancyUtility}', [TenancyUtilityController::class, 'destroy']);

            Route::get('utility-bills', [UtilityBillController::class, 'index']);
            Route::get('utility-bills/{utilityBill}', [UtilityBillController::class, 'show']);
            Route::put('utility-bills/{utilityBill}', [UtilityBillController::class, 'update']);
            Route::post('utility-bills/{utilityBill}/waive', [UtilityBillController::class, 'waive']);

            // Rent Bill Management
            Route::get('rent-bills', [RentBillController::class, 'index']);
            Route::get('rent-bills/overdue', [RentBillController::class, 'overdue']);
            Route::get('rent-bills/pending', [RentBillController::class, 'pending']);
            Route::get('rent-bills/{id}', [RentBillController::class, 'show']);
            Route::post('rent-bills/{id}/waive', [RentBillController::class, 'waive']);

            // Landlord Profile Management
            Route::get('profile', [LandlordProfileController::class, 'show']);
            Route::put('profile', [LandlordProfileController::class, 'update']);

            // Password Update (with rate limiting: 5 attempts per minute)
            Route::put('password', [PasswordController::class, 'update'])->middleware('throttle:5,1');
        });
    });

    // Public authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
};

// Unversioned routes (e.g. /api/auth/login)
$defineApiRoutes();

// Versioned routes for mobile/web clients (e.g. /api/v1/auth/login)
Route::prefix('v1')->group($defineApiRoutes);
