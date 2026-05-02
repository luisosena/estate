<?php

namespace App\Providers;

use App\Contracts\PaymentGatewayInterface;
use App\PaymentGateways\ManualGateway;
use App\PaymentGateways\MpesaGateway;
use Illuminate\Support\ServiceProvider;

/**
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 *
 * This file is part of the payment gateway scaffold. It has been ported from
 * the `architectural-refactoring` branch but is NOT yet wired into the
 * application. No route, controller, or service provider references this file.
 *
 * To activate: follow docs/plans/porting-plan.md Phase 3 wiring steps.
 * To remove:   follow the teardown inventory in handoff_payment_scaffold.md.
 */
class PaymentGatewayServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function ($app) {
            $defaultGateway = config('payments.default_gateway', 'manual');

            return match ($defaultGateway) {
                'mpesa' => new MpesaGateway(config('payments.mpesa', [])),
                default => new ManualGateway,
            };
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
