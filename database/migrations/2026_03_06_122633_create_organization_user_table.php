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
        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            /**
             * Why a pivot table:
             * - one user can belong to many orgs
             * - within an org, the user can have multiple "capabilities" (employee + trainer, etc.)
             *
             * We'll store these capabilities as booleans for the MVP.
             * Later we can evolve to a more granular permission system without changing the concept.
             */
            $table->boolean('is_org_admin')->default(false);
            $table->boolean('is_sub_admin')->default(false);
            $table->boolean('is_employee')->default(true);
            $table->boolean('is_trainer')->default(false);

            // Sub-admin write permissions (MVP subset; we can expand as needed)
            $table->boolean('can_manage_courses')->default(false);
            $table->boolean('can_manage_reporting')->default(false);

            // Employee profile fields (scoped to org)
            $table->string('employee_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('category')->nullable(); // e.g. Permanent/Contract/Intern

            // Org structure placement
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();

            // Used for time-in-role eligibility checks
            $table->date('role_started_at')->nullable();

            // Optional line manager within same org
            $table->foreignId('manager_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
            $table->unique(['organization_id', 'employee_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_user');
    }
};
