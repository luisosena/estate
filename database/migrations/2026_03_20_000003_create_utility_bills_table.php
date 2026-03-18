<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utility_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_utility_id')
                  ->constrained('tenancy_utilities')
                  ->cascadeOnDelete();
            $table->date('billing_month');                        // store as first day of the month, e.g. 2026-03-01
            $table->decimal('units_consumed', 10, 3)->nullable(); // null for flat-rate utilities
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid', 'partial', 'overdue', 'waived'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            // One bill per utility per billing month
            $table->unique(['tenancy_utility_id', 'billing_month'], 'uq_utility_bill_month');

            $table->index('tenancy_utility_id');
            $table->index('billing_month');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utility_bills');
    }
};
