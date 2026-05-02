<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes for frequently queried date columns on tenancies.
     *
     * Note: tenancies.status, payments.status, rent_bills.status, and rent_bills.due_date
     * indexes already exist in the database from earlier migrations.
     */
    public function up(): void
    {
        Schema::table('tenancies', function (Blueprint $table) {
            $table->index('move_in_date', 'tenancies_move_in_date_index');
            $table->index('move_out_date', 'tenancies_move_out_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('tenancies', function (Blueprint $table) {
            $table->dropIndex('tenancies_move_in_date_index');
            $table->dropIndex('tenancies_move_out_date_index');
        });
    }
};
