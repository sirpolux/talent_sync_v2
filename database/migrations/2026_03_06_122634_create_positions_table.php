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
        Schema::create('positions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();

            $table->string('name');
            $table->string('slug');

            // Minimum months in this position before eligible to move
            $table->unsignedSmallInteger('min_months_in_role')->default(0);

            $table->text('responsibilities')->nullable();
            $table->unsignedInteger('level')->default(1);
            $table->string('role_id')->nullable();
            $table->unsignedInteger('duration_before_promotion')->nullable();
            $table->enum('duration_before_promotion_type', ['DAYS', 'MONTHS', 'YEARS'])->nullable();
            $table->string('reports_to')->nullable();
            $table->string('added_by')->nullable();

            // Uniqueness only within a tenant
            $table->unique(['organization_id', 'slug']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
