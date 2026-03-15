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
        Schema::create('career_path_steps', function (Blueprint $table) {
            $table->id();

            // tenant-safe (also derivable via career_path->organization_id, but explicit for safety/indexing)
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            $table->foreignId('career_path_id')->constrained('career_paths')->cascadeOnDelete();

            // Each step is a transition edge (from -> to) within a named path/track
            $table->foreignId('from_position_id')->constrained('positions')->cascadeOnDelete();
            $table->foreignId('to_position_id')->constrained('positions')->cascadeOnDelete();

            // Optional ordering hint for "default/linear" representation (branches can share same order)
            $table->unsignedInteger('order')->nullable();

            // Optional label for the edge within the path (e.g. "IC Track", "Mgmt Track")
            $table->string('track')->nullable();

            // Prevent duplicates within a path and tenant
            $table->unique(
                ['organization_id', 'career_path_id', 'from_position_id', 'to_position_id'],
                'org_career_path_step_unique'
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_path_steps');
    }
};
