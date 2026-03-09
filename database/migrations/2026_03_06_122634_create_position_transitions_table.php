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
        Schema::create('position_transitions', function (Blueprint $table) {
            $table->id();

            // Keep this table tenant-safe even though positions are tenant-scoped
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            $table->foreignId('from_position_id')->constrained('positions')->cascadeOnDelete();
            $table->foreignId('to_position_id')->constrained('positions')->cascadeOnDelete();

            // Optional: label the track (e.g., "Technical", "Supervisory")
            $table->string('track')->nullable();

            // Avoid duplicates within a tenant
            // MySQL has a 64-char identifier limit; provide a shorter index name explicitly.
            $table->unique(['organization_id', 'from_position_id', 'to_position_id'], 'org_pos_transition_unique');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('position_transitions');
    }
};
