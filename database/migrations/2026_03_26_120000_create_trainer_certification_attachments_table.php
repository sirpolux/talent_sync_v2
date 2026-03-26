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

            $table->unsignedBigInteger('trainer_certification_id');

            $table->foreign('trainer_certification_id', 'tca_cert_fk')
                ->references('id')
                ->on('trainer_certifications')
                ->cascadeOnDelete();
        

            $table->string('name');
            $table->string('image_url');

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
