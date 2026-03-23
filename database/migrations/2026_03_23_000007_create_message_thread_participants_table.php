<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_thread_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['message_thread_id', 'organization_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_thread_participants');
    }
};