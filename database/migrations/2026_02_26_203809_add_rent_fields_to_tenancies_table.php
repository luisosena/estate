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
        Schema::table('tenancies', function (Blueprint $table) {
            $table->decimal('monthly_rent', 10, 2)->after('move_out_date');
            $table->decimal('security_deposit', 10, 2)->nullable()->after('monthly_rent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenancies', function (Blueprint $table) {
            $table->dropColumn(['monthly_rent', 'security_deposit']);
        });
    }
};
