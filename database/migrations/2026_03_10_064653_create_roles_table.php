<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('responsibilities');
            $table->unsignedInteger('level')->default(1);

            // Optional external/legacy id if you want to map/import roles
            $table->string('role_id')->nullable();

            $table->unsignedInteger('duration_before_promotion')->nullable();
            $table->enum('duration_before_promotion_type', ['DAYS', 'MONTHS', 'YEARS'])->nullable();

            // Keeping as string per your request (could be role slug/code)
            $table->string('reports_to')->nullable();

            // Tenant scoping: organization + department
            // Keeping department_id as string per your request
            $table->string('department_id');
            $table->unsignedBigInteger('organization_id');

            // Keeping as string per your request (likely user id)
            $table->string('added_by');

            $table->timestamps();

            $table->index(['organization_id', 'department_id']);
            $table->index('department_id');
            $table->index('organization_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
