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
        Schema::table('positions', function (Blueprint $table) {
            $table->text('responsibilities')->nullable();
            $table->unsignedInteger('level')->default(1);
            $table->string('role_id')->nullable();
            $table->unsignedInteger('duration_before_promotion')->nullable();
            $table->enum('duration_before_promotion_type', ['DAYS', 'MONTHS', 'YEARS'])->nullable();
            $table->string('reports_to')->nullable();
            $table->string('added_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropColumn([
                'responsibilities',
                'level',
                'role_id',
                'duration_before_promotion',
                'duration_before_promotion_type',
                'reports_to',
                'added_by',
            ]);
        });
    }
};
