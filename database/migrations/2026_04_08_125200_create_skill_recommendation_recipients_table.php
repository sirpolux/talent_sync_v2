<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_recommendation_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_recommendation_id')->constrained('skill_recommendations')->cascadeOnDelete();
            $table->foreignId('organization_user_id')->constrained('organization_user')->cascadeOnDelete();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->string('registration_status')->default('pending');
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['skill_recommendation_id', 'organization_user_id'], 'skill_recommendation_recipients_unique');
            $table->index(['organization_user_id', 'registration_status'], 'srr_org_user_reg_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_recommendation_recipients');
    }
};
