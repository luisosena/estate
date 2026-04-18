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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('emergency_contact_name')->nullable()->change();
            $table->string('emergency_contact_phone')->nullable()->change();
            $table->string('emergency_contact_relation')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('emergency_contact_name')->nullable(false)->change();
            $table->string('emergency_contact_phone')->nullable(false)->change();
            $table->string('emergency_contact_relation')->nullable(false)->change();
        });
    }
};
