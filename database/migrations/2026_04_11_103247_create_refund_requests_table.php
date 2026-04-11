<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refund_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan', 20);
            $table->decimal('amount', 8, 2)->nullable();
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('plan_ends_at')->nullable()->after('plan_renews_at');
            $table->timestamp('subscription_started_at')->nullable()->after('plan_ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refund_requests');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan_ends_at', 'subscription_started_at']);
        });
    }
};
