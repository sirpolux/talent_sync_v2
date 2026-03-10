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
        Schema::create('grading_systems', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            
            // JSON field for grade scale (e.g., {"A": 90, "B": 80, "C": 70, "D": 60, "F": 0})
            $table->json('grade_scale');
            
            // Passing grade identifier (e.g., "C" or "70")
            $table->string('passing_grade');
            
            // Uniqueness within organization
            $table->unique(['organization_id', 'name']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grading_systems');
    }
};
