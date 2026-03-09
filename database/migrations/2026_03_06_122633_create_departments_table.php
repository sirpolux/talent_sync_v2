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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string("department_code", 20)->nullable();
            $table->string("description");
            $table->integer("roles_count")->default(0);
            $table->integer("staff_count")->default(0);
            $table->foreignId("added_by")->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug');

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
        Schema::dropIfExists('departments');
    }
};
