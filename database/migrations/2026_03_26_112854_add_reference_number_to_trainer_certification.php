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
        Schema::table('trainer_certifications', function (Blueprint $table) {
            $table->string('reference_number')->nullable()->after('issuer');
            $table->text('notes')->nullable()->after('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainer_certifications', function (Blueprint $table) {
            //
            $table->dropColumn('reference_number');
            $table->dropColumn('notes');
        });
    }
};
