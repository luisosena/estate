<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Tenant\DashboardController;
use App\Http\Controllers\Api\Tenant\PaymentsController;
use App\Http\Controllers\Api\Tenant\UtilitiesController;
use App\Http\Controllers\Api\Landlord\DashboardController as LandlordDashboardController;
use App\Http\Controllers\Api\Landlord\PropertyController;
use App\Http\Controllers\Api\Landlord\UnitController;
use App\Http\Controllers\Api\Landlord\TenantController;
use App\Http\Controllers\Api\Landlord\PaymentController;
use App\Http\Controllers\Api\Landlord\NotificationController;

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
        });

        // Tenant routes
        Route::prefix('tenant')->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index']);
            Route::get('payments', [PaymentsController::class, 'index']);
            Route::get('utilities', [UtilitiesController::class, 'index']);
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
            Route::get('tenants/{tenantCode}', [TenantController::class, 'show']);
            Route::post('tenants', [TenantController::class, 'store']);
            Route::put('tenants/{tenantCode}', [TenantController::class, 'update']);
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
        });
    });

    // Public authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
};

// Unversioned routes (e.g. /api/auth/login)
$defineApiRoutes();

// Versioned routes for mobile/web clients (e.g. /api/v1/auth/login)
Route::prefix('v1')->group($defineApiRoutes);
