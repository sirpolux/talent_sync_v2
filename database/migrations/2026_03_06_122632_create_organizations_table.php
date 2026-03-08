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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();

            // Tenant identity / profile
            $table->string('company_name');
            $table->string('slug')->unique();

            $table->string('company_type')->nullable();
            $table->string('company_address')->nullable();
            $table->string('company_email')->unique()->nullable();
            $table->text('company_description')->nullable();
            $table->date('date_of_incoporation')->nullable();
            $table->string('rn_number')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('employee_range')->nullable();
            $table->string('company_size')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('local_government')->nullable();
            $table->string('province')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('contact_number')->nullable();

            // Created by (user id as string for now; we can make it FK later if you prefer)
            $table->string('created_by');

            // Onboarding
            $table->integer('onboarding_stage')->default(0);
            $table->boolean('onboarding_complete')->default(false);

            // Config toggles for the tenant
            $table->boolean('allow_self_registration')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
