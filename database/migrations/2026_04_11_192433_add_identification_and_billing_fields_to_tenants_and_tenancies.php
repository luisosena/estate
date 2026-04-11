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
        Schema::table('tenancies', function (Blueprint $blueprint) {
            $blueprint->integer('rent_due_day')->default(5)->after('monthly_rent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenancies', function (Blueprint $blueprint) {
            $blueprint->dropColumn('rent_due_day');
        });
    }
};
