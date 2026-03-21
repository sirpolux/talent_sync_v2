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
        Schema::table('trainer_certifications', function (Blueprint $table) {
            // Avoid Doctrine dependency; MySQL will error if it already exists, so we guard.
            // (If constraints were already created, these checks prevent duplicate statements.)

            if (!Schema::hasColumn('trainer_certifications', 'trainer_specialty_id')) {
                return;
            }

            // Add FK if missing: best-effort (will throw if already exists)
            try {
                $table
                    ->foreign('trainer_specialty_id')
                    ->references('id')
                    ->on('trainer_specialties')
                    ->cascadeOnDelete();
            } catch (\Throwable $e) {
                // ignore (likely already exists)
            }

            // Add unique if missing: best-effort (will throw if already exists)
            try {
                $table->unique(['trainer_specialty_id', 'name', 'issuer'], 'trainer_certifications_trainer_specialty_id_name_issuer_unique');
            } catch (\Throwable $e) {
                // ignore (likely already exists)
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainer_certifications', function (Blueprint $table) {
            try {
                $table->dropForeign('trainer_certifications_trainer_specialty_id_foreign');
            } catch (\Throwable $e) {
                // ignore
            }

            try {
                $table->dropUnique('trainer_certifications_trainer_specialty_id_name_issuer_unique');
            } catch (\Throwable $e) {
                // ignore
            }
        });
    }
};
