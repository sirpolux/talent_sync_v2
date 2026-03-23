<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_session_participant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_organization_user_id')->constrained('organization_user')->cascadeOnDelete();
            $table->foreignId('updater_organization_user_id')->constrained('organization_user')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_progress');
    }
};
