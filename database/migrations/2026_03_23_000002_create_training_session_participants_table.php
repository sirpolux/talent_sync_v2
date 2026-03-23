<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_session_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['training_session_id', 'organization_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_session_participants');
    }
};