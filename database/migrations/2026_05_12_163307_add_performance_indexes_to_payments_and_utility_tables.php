<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // payments: composite for rent sum calculations
        Schema::table('payments', function (Blueprint $table): void {
            $table->index(['tenancy_id', 'status', 'payment_type'], 'idx_payments_tenancy_status_type');
            // payments: for MTD revenue (paid_at range filter)
            $table->index('paid_at', 'idx_payments_paid_at');
        });

        // utility_bills: for overdue scope (status + due_date)
        Schema::table('utility_bills', function (Blueprint $table): void {
            $table->index(['status', 'due_date'], 'idx_utility_bills_status_due_date');
        });

        // tenancy_utilities: for active utility filter
        Schema::table('tenancy_utilities', function (Blueprint $table): void {
            $table->index(['tenancy_id', 'status'], 'idx_tenancy_utilities_tenancy_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropIndex('idx_payments_tenancy_status_type');
            $table->dropIndex('idx_payments_paid_at');
        });

        Schema::table('utility_bills', function (Blueprint $table): void {
            $table->dropIndex('idx_utility_bills_status_due_date');
        });

        Schema::table('tenancy_utilities', function (Blueprint $table): void {
            $table->dropIndex('idx_tenancy_utilities_tenancy_status');
        });
    }
};
