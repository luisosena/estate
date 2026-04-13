<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('utility_bill_id')
                  ->nullable()
                  ->after('tenancy_id')
                  ->constrained('utility_bills')
                  ->nullOnDelete();

            $table->index('utility_bill_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['utility_bill_id']);
            $table->dropColumn('utility_bill_id');
        });
    }
};
