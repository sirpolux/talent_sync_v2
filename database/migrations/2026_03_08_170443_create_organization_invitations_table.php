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
        Schema::create('organization_invitations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('email');

            /**
             * What is being invited for.
             * Why string + index (instead of enum):
             * - easy to extend later (e.g. "employee", "trainer", "sub_admin")
             * - keeps DB portable across engines
             */
            $table->string('role');

            // Role configuration payload (optional). Example: {"is_trainer": true, "can_manage_courses": false}
            $table->json('meta')->nullable();

            // Secure confirmation token
            $table->string('token')->unique();

            // Invitation lifecycle
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();

            // Avoid spamming duplicates: 1 active invite per org/email/role.
            $table->unique(['organization_id', 'email', 'role']);

            $table->index(['email', 'token']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_invitations');
    }
};
