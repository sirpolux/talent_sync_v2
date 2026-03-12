<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organization_user', function (Blueprint $table) {
            // membership confirmation state (Option B)
            if (!Schema::hasColumn('organization_user', 'membership_status')) {
                $table->string('membership_status')->default('pending')->after('onboarding_stage');
            }

            if (!Schema::hasColumn('organization_user', 'membership_confirmed_at')) {
                $table->timestamp('membership_confirmed_at')->nullable()->after('membership_status');
            }

            // Optional audit: who confirmed (admin/system)
            if (!Schema::hasColumn('organization_user', 'membership_confirmed_by_user_id')) {
                $table
                    ->foreignId('membership_confirmed_by_user_id')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete()
                    ->after('membership_confirmed_at');
            }

            $table->index(['organization_id', 'membership_status']);
        });
    }

    public function down(): void
    {
        Schema::table('organization_user', function (Blueprint $table) {
            // Drop FK first if it exists (Laravel will infer the constraint name in most cases)
            if (Schema::hasColumn('organization_user', 'membership_confirmed_by_user_id')) {
                $table->dropConstrainedForeignId('membership_confirmed_by_user_id');
            }

            if (Schema::hasColumn('organization_user', 'membership_confirmed_at')) {
                $table->dropColumn('membership_confirmed_at');
            }

            if (Schema::hasColumn('organization_user', 'membership_status')) {
                $table->dropColumn('membership_status');
            }

            $table->dropIndex(['organization_id', 'membership_status']);
        });
    }
};
