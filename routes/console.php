<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule daily tenancy management tasks
Schedule::command('tenancy:end-expired')
    ->daily()
    ->at('02:00') // Run at 2 AM to avoid peak hours
    ->description('Check for expired tenancies and send expiration notifications')
    ->withoutOverlapping();
