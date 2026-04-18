<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('rent_bill_id')
                ->nullable()
                ->after('tenancy_id')
                ->constrained('rent_bills')
                ->nullOnDelete();

            $table->index('rent_bill_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['rent_bill_id']);
            $table->dropColumn('rent_bill_id');
        });
    }
};
