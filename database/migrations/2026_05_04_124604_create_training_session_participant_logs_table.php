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
        Schema::create('training_session_participant_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_participant_id')->constrained('training_session_participants', 'tsp_logs_participant_fk')->cascadeOnDelete();
            $table->string('action', 50); // 'status_changed', 'approved', 'rejected', etc.
            $table->string('old_status', 20)->nullable();
            $table->string('new_status', 20);
            $table->foreignId('performed_by')->constrained('users', 'tsp_logs_user_fk')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Additional data like capacity info, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_session_participant_logs');
    }
};
