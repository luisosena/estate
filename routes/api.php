<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\SessionController;
use App\Http\Controllers\Api\Tenant\DashboardController;
use App\Http\Controllers\Api\Tenant\PaymentsController;
use App\Http\Controllers\Api\Tenant\UtilitiesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
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
                Route::delete('sessions/{tokenId}', [SessionController::class, 'terminate']);
                Route::delete('sessions/terminate-all', [SessionController::class, 'terminateAll']);
            });
        });

        // Tenant routes
        Route::prefix('tenant')->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index']);
            Route::get('payments', [PaymentsController::class, 'index']);
            Route::get('utilities', [UtilitiesController::class, 'index']);
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
