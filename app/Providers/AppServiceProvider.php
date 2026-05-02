<?php

namespace App\Providers;

use App\Events\PaymentConfirmed;
use App\Listeners\ProcessPaymentConfirmed;
use App\Policies\NotificationPolicy;
use App\Services\DocSyncService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(DocSyncService::class, function ($app) {
            return new DocSyncService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Payment event wiring — activated when gateway is wired in Phase 3
        Event::listen(PaymentConfirmed::class, ProcessPaymentConfirmed::class);

        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        Gate::policy(DatabaseNotification::class, NotificationPolicy::class);

        Model::preventLazyLoading(! app()->isProduction());

        $this->configureDefaults();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
