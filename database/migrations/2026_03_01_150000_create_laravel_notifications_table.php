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
        // Check if table exists and drop it if it does
        if (Schema::hasTable('notifications')) {
            Schema::drop('notifications');
        }

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Laravel uses UUID for notifications
            $table->string('type');
            $table->morphs('notifiable'); // Polymorphic: can be User or Tenant (automatically creates index)
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Additional indexes for performance
            $table->index('read_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
