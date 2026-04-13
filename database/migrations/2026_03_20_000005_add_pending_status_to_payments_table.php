<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds 'pending' status to payments table for utility payments
     * that start as pending until approved.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add pending status to enum
            $table->enum('status', ['paid', 'partial', 'overdue', 'cancelled', 'pending'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Revert enum to previous values
            $table->enum('status', ['paid', 'partial', 'overdue', 'cancelled'])->change();
        });
    }
};
