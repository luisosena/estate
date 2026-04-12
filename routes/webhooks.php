<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Webhook\MpesaWebhookController;

/*
|--------------------------------------------------------------------------
| Webhook Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group without CSRF protection.
|
*/

// M-Pesa Callbacks
Route::post('/mpesa/callback', [MpesaWebhookController::class, 'handleCallback']);
