<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upsell_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upsell_offer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('welcome_package_id')->constrained()->cascadeOnDelete();
            $table->string('guest_email');
            $table->string('guest_name')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('host_notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upsell_requests');
    }
};
