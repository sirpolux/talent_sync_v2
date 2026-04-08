<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recommended_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recommended_by_role')->nullable();
            $table->string('source_type')->default('manual');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('target_type')->default('employee');
            $table->text('reason')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('recommended_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'skill_id']);
            $table->index(['source_type', 'source_id']);
            $table->index(['target_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_recommendations');
    }
};
