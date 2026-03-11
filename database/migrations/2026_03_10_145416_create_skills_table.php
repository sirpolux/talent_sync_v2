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
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            
            // Nullable to support global/system skills (organization_id = null)
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['skill', 'course', 'degree']);
            $table->enum('category', ['Soft Skills', 'Technical', 'Educational']);
            // Default to true so a newly created skill (org-scoped) applies to all departments unless specified
            $table->boolean("applies_to_all_departments")->default(true);
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean("is_active")->default(true);
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
        Schema::dropIfExists('skills');
    }
};
