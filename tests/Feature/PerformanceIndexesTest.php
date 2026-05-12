<?php

use Illuminate\Support\Facades\Schema;

it('payments table has the performance indexes', function (): void {
    $indexes = collect(Schema::getIndexes('payments'))->pluck('name');
    expect($indexes)->toContain('idx_payments_tenancy_status_type');
    expect($indexes)->toContain('idx_payments_paid_at');
});

it('utility_bills table has the status_due_date index', function (): void {
    $indexes = collect(Schema::getIndexes('utility_bills'))->pluck('name');
    expect($indexes)->toContain('idx_utility_bills_status_due_date');
});

it('tenancy_utilities table has the tenancy_status index', function (): void {
    $indexes = collect(Schema::getIndexes('tenancy_utilities'))->pluck('name');
    expect($indexes)->toContain('idx_tenancy_utilities_tenancy_status');
});
