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
        Schema::create('position_skills', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('position_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            
            $table->enum('required_proficiency', ['beginner', 'intermediate', 'advanced', 'expert']);
            $table->boolean('is_required')->default(true);
            $table->decimal('minimum_score', 5, 2)->nullable(); // For grading system integration
            
            // Prevent duplicate skill assignments per position
            $table->unique(['position_id', 'skill_id']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('position_skills');
    }
};
