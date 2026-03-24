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
        Schema::table('trainer_specialties', function (Blueprint $table) {
            $table->foreignId('skill_id')
                ->nullable()
                ->after('trainer_profile_id')
                ->constrained('skills')
                ->nullOnDelete();

            $table->unique(['trainer_profile_id', 'skill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainer_specialties', function (Blueprint $table) {
            $table->dropUnique(['trainer_profile_id', 'skill_id']);
            $table->dropConstrainedForeignId('skill_id');
        });
    }
};