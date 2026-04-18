<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds:
     * - 'cancelled' status to the status enum
     * - Database indexes on frequently queried columns
     * - Soft delete support (deleted_at column)
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add cancelled status to enum
            $table->enum('status', ['paid', 'partial', 'overdue', 'cancelled'])->change();

            // Add soft deletes column
            $table->softDeletes();

            // Add indexes on frequently queried columns
            $table->index('tenant_id');
            $table->index('tenancy_id');
            $table->index('status');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Remove indexes
            $table->dropIndex(['tenant_id']);
            $table->dropIndex(['tenancy_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['paid_at']);

            // Remove soft deletes
            $table->dropSoftDeletes();

            // Revert enum to original values
            $table->enum('status', ['paid', 'partial', 'overdue'])->change();
        });
    }
};
