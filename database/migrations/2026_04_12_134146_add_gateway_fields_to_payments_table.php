<?php

/*
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 * Adds gateway fields to the payments table.
 * Rollback with: php artisan migrate:rollback --step=1
 */

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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('gateway')->default('manual')->after('payment_method');
            $table->string('checkout_request_id')->nullable()->after('gateway');
            $table->string('gateway_reference')->nullable()->after('checkout_request_id');
            $table->string('gateway_status')->nullable()->after('gateway_reference');
            $table->json('gateway_metadata')->nullable()->after('gateway_status');
            $table->timestamp('gateway_confirmed_at')->nullable()->after('gateway_metadata');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'gateway',
                'checkout_request_id',
                'gateway_reference',
                'gateway_status',
                'gateway_metadata',
                'gateway_confirmed_at',
            ]);
        });
    }
};
