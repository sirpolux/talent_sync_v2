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
        Schema::create('career_paths', function (Blueprint $table) {
            $table->id();

            // tenant-safe
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            // Human name for the path, e.g. "Backend Engineering", "Sales Leadership"
            $table->string('name');

            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            // Avoid duplicates within a tenant
            $table->unique(['organization_id', 'name'], 'org_career_path_name_unique');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_paths');
    }
};
