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
        Schema::create('employee_career_path_selections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_user_id')->constrained('organization_user')->cascadeOnDelete();
            $table->foreignId('career_path_id')->constrained('career_paths')->cascadeOnDelete();

            $table->boolean('is_active')->default(true);
            $table->timestamp('selected_at')->nullable();

            $table->timestamps();

            $table->unique(
                ['organization_id', 'organization_user_id', 'is_active'],
                'org_employee_career_path_active_unique'
            );

            $table->index(['organization_id', 'organization_user_id'], 'org_employee_career_path_employee_idx');
            $table->index(['organization_id', 'career_path_id'], 'org_employee_career_path_path_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_career_path_selections');
    }
};