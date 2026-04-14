<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upsell_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upsell_offer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('welcome_package_id')->constrained()->cascadeOnDelete();
            $table->string('guest_email');
            $table->string('guest_name')->nullable();
            $table->string('message')->nullable();
            $table->decimal('amount', 8, 2);        // what guest pays
            $table->decimal('commission', 8, 2);    // platform cut (15%)
            $table->string('stripe_session_id')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->enum('status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('host_notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upsell_orders');
    }
};
