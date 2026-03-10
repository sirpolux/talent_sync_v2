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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('grading_system_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('min_value', 5, 2);
            $table->decimal('max_value', 5, 2);
            $table->text('description')->nullable();
            
            // Ordering of grades within system
            $table->unsignedInteger('order')->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
