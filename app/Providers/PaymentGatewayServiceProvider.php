<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\PaymentGatewayInterface;
use App\PaymentGateways\ManualGateway;
use App\PaymentGateways\MpesaGateway;

class PaymentGatewayServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function ($app) {
            $defaultGateway = config('payments.default_gateway', 'manual');

            return match($defaultGateway) {
                'mpesa'  => new MpesaGateway(config('payments.mpesa', [])),
                default  => new ManualGateway(),
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
