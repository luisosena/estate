<?php

/*
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 * Not wired into the application. See handoff_payment_scaffold.md for details.
 */

return [

    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | This option controls which payment gateway is used by default.
    | Supported: "manual", "mpesa"
    |
    */

    'default_gateway' => env('PAYMENTS_DEFAULT_GATEWAY', 'manual'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the M-Pesa Daraja API (STK Push).
    |
    */

    'mpesa' => [
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'business_short_code' => env('MPESA_BUSINESS_SHORT_CODE'),
        'passkey' => env('MPESA_PASSKEY'),
        'callback_url' => env('MPESA_CALLBACK_URL'),
        'environment' => env('MPESA_ENVIRONMENT', 'sandbox'), // sandbox | production
    ],

];
