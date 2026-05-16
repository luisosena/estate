<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->morphs('documentable');
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->string('file_type', 50);
            $table->unsignedBigInteger('file_size');
            $table->enum('category', ['tenancy_agreement', 'receipt', 'inspection_photo', 'id_document', 'other']);
            $table->timestamp('uploaded_at');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['documentable_type', 'documentable_id', 'category']);
            $table->index(['documentable_type', 'documentable_id', 'uploaded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
