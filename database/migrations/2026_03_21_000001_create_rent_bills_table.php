<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rent_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_id')
                ->constrained('tenancies')
                ->cascadeOnDelete();
            $table->date('billing_month');              // store as first day of the month, e.g. 2026-03-01
            $table->decimal('amount_due', 12, 2);       // the monthly rent amount
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid', 'partial', 'overdue', 'waived'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            // One bill per tenancy per billing month
            $table->unique(['tenancy_id', 'billing_month'], 'uq_rent_bill_month');

            $table->index('tenancy_id');
            $table->index('billing_month');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_bills');
    }
};
