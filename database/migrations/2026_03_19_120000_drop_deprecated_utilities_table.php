<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the deprecated utilities table.
     * This table has been replaced by the new utility system:
     * - utility_types (types of utilities)
     * - tenancy_utilities (utilities assigned to tenancies)
     * - utility_bills (bills generated for tenancy utilities)
     */
    public function up(): void
    {
        Schema::dropIfExists('utilities');
    }

    /**
     * Reverse the migration.
     * Note: This will fail if the new utility tables already exist due to foreign key constraints.
     */
    public function down(): void
    {
        Schema::create('utilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['water', 'electricity', 'gas', 'internet', 'security']);
            $table->decimal('amount', 10, 2);
            $table->string('billing_period');
            $table->enum('status', ['paid', 'unpaid']);
            $table->timestamps();
        });
    }
};
