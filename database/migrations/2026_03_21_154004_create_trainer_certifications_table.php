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
        if (Schema::hasTable('trainer_certifications')) {
            return;
        }

        Schema::create('trainer_certifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trainer_specialty_id')
                ->constrained('trainer_specialties')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('issuer')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->string('credential_id')->nullable();
            $table->string('credential_url')->nullable();

            $table->timestamps();

            $table->unique(['trainer_specialty_id', 'name', 'issuer']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_certifications');
    }
};
