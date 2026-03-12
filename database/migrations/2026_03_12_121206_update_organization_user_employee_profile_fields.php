<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organization_user', function (Blueprint $table) {
            // Rename columns for clearer domain language
            if (Schema::hasColumn('organization_user', 'category')) {
                $table->renameColumn('category', 'employment_type');
            }

            if (Schema::hasColumn('organization_user', 'role_started_at')) {
                $table->renameColumn('role_started_at', 'date_started_current_position');
            }

            // Required onboarding + employee profile fields (scoped to org)
            if (!Schema::hasColumn('organization_user', 'gender')) {
                $table->string('gender', 10)->nullable()->after('phone');
            }

            if (!Schema::hasColumn('organization_user', 'nationality')) {
                $table->string('nationality')->nullable()->after('gender');
            }

            if (!Schema::hasColumn('organization_user', 'state')) {
                $table->string('state', 50)->nullable()->after('nationality');
            }

            if (!Schema::hasColumn('organization_user', 'work_mode')) {
                $table->string('work_mode')->nullable()->after('employment_type');
            }

            if (!Schema::hasColumn('organization_user', 'employment_date')) {
                $table->date('employment_date')->nullable()->after('work_mode');
            }

            if (!Schema::hasColumn('organization_user', 'onboarding_stage')) {
                // 4 stages: invited -> profile -> job -> completed
                $table->string('onboarding_stage')->default('invited')->after('employment_date');
            }
        });

        /**
         * NOTE:
         * We intentionally add these new "required" fields as nullable at DB-level for safe rollout.
         * Validation rules in the app should enforce required-ness based on onboarding_stage.
         */
    }

    public function down(): void
    {
        Schema::table('organization_user', function (Blueprint $table) {
            if (Schema::hasColumn('organization_user', 'onboarding_stage')) {
                $table->dropColumn('onboarding_stage');
            }

            if (Schema::hasColumn('organization_user', 'employment_date')) {
                $table->dropColumn('employment_date');
            }

            if (Schema::hasColumn('organization_user', 'work_mode')) {
                $table->dropColumn('work_mode');
            }

            if (Schema::hasColumn('organization_user', 'state')) {
                $table->dropColumn('state');
            }

            if (Schema::hasColumn('organization_user', 'nationality')) {
                $table->dropColumn('nationality');
            }

            if (Schema::hasColumn('organization_user', 'gender')) {
                $table->dropColumn('gender');
            }

            // Revert renames
            if (Schema::hasColumn('organization_user', 'employment_type')) {
                $table->renameColumn('employment_type', 'category');
            }

            if (Schema::hasColumn('organization_user', 'date_started_current_position')) {
                $table->renameColumn('date_started_current_position', 'role_started_at');
            }
        });
    }
};
