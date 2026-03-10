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
        Schema::table('positions', function (Blueprint $table) {
            // Fix level field to be enum instead of int
            $table->dropColumn('level');
            $table->enum('level', ['entry', 'intermediate', 'senior', 'lead', 'manager', 'director'])->default('entry');
            
            // Fix duration types to match frontend (lowercase)
            $table->dropColumn('duration_before_promotion_type');
            $table->enum('duration_before_promotion_type', ['days', 'weeks', 'months', 'years'])->nullable();
            
            // Fix reports_to to be proper foreign key
            $table->dropColumn('reports_to');
            $table->foreignId('reports_to_position_id')->nullable()->constrained('positions')->nullOnDelete();
            
            // Add promotion hierarchy
            $table->foreignId('parent_position_id')->nullable()->constrained('positions')->nullOnDelete();
            
            // Add grading system link (without FK constraint for now)
            $table->foreignId('grading_system_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            // Reverse the changes
            $table->dropForeign(['reports_to_position_id']);
            $table->dropForeign(['parent_position_id']);
            
            $table->dropColumn(['reports_to_position_id', 'parent_position_id', 'grading_system_id']);
            
            // Restore original columns
            $table->dropColumn('level');
            $table->unsignedInteger('level')->default(1);
            
            $table->dropColumn('duration_before_promotion_type');
            $table->enum('duration_before_promotion_type', ['DAYS', 'MONTHS', 'YEARS'])->nullable();
            
            $table->string('reports_to')->nullable();
        });
    }
};
