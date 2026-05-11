<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Change cascade-on-delete to restrict-on-delete for financial tables.
     * This prevents accidental destruction of payment and rent bill records
     * when a tenant or tenancy is deleted.
     *
     * To delete a tenant/tenancy, financial records must be archived first.
     */
    public function up(): void
    {
        // payments.tenant_id
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->restrictOnDelete();
        });

        // payments.tenancy_id
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')
                ->references('id')
                ->on('tenancies')
                ->restrictOnDelete();
        });

        // rent_bills.tenancy_id
        Schema::table('rent_bills', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')
                ->references('id')
                ->on('tenancies')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        // Restore cascade behaviour
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')->references('id')->on('tenancies')->cascadeOnDelete();
        });

        Schema::table('rent_bills', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')->references('id')->on('tenancies')->cascadeOnDelete();
        });
    }
};
