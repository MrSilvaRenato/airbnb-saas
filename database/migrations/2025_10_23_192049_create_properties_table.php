<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('properties')) {
            Schema::create('properties', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // host owner
                $table->string('title');
                $table->string('address')->nullable();
                $table->time('check_in_time')->nullable();
                $table->time('check_out_time')->nullable();
                $table->string('wifi_name')->nullable();
                $table->string('wifi_password')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('properties');
    }
};
