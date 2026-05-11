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
        Schema::table('tenants', function (Blueprint $table): void {
            // Make tenant_code nullable to allow auto-generation after insert
            $table->string('tenant_code')->nullable()->change();
            $table->unique('tenant_code', 'uq_tenants_tenant_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropUnique('uq_tenants_tenant_code');
            $table->string('tenant_code')->nullable(false)->change();
        });
    }
};
