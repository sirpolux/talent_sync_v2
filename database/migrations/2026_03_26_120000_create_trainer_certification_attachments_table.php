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
        if (Schema::hasTable('trainer_certification_attachments')) {
            return;
        }

        Schema::create('trainer_certification_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trainer_certification_id')
                ->constrained('trainer_certifications')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('file_size')->nullable();
            $table->string('cloudinary_public_id');
            $table->string('cloudinary_url');
            $table->string('cloudinary_secure_url');
            $table->json('metadata')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_certification_attachments');
    }
};