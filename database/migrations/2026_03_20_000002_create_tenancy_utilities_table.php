<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenancy_utilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_id')
                ->constrained('tenancies')
                ->cascadeOnDelete();
            $table->foreignId('utility_type_id')
                ->constrained('utility_types')
                ->restrictOnDelete();
            $table->decimal('amount', 12, 2);                             // agreed fixed amount (for flat-rate utilities)
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'annual'])->default('monthly');
            $table->string('provider', 255)->nullable();                  // migrated from old utilities.provider
            $table->string('account_number', 100)->nullable();            // migrated from old utilities.account_number
            $table->string('meter_number', 100)->nullable();              // migrated from old utilities.meter_number
            $table->enum('status', ['active', 'suspended', 'disconnected'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            // A tenancy cannot have the same utility type assigned twice
            $table->unique(['tenancy_id', 'utility_type_id'], 'uq_tenancy_utility');

            $table->index('tenancy_id');
            $table->index('utility_type_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenancy_utilities');
    }
};
