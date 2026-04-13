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
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete(); // null = applies to all properties
            $table->string('trigger'); // booking_confirmed | checkin_reminder | checkin_day | checkout_reminder
            $table->integer('send_offset_hours')->default(0); // e.g. -48 = 48h before check-in
            $table->string('subject');
            $table->text('body'); // supports {{guest_name}}, {{property}}, {{checkin}}, {{checkout}}, {{link}}
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_templates');
    }
};
