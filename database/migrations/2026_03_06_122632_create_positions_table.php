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
            // NOTE: departments table is created in a later migration (timestamp order),
            // so we can't add an FK constraint here without breaking `migrate:fresh`.
            // We add the foreign key in the departments migration after both tables exist.
            $table->unsignedBigInteger('department_id');

            $table->string('name');
            $table->string('slug');

            // Minimum months in this position before eligible to move
            $table->unsignedSmallInteger('min_months_in_role')->default(0);

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
