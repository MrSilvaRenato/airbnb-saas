<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('package_visits')) {
            Schema::create('package_visits', function (Blueprint $table) {
                $table->id();
                $table->foreignId('welcome_package_id')->constrained()->cascadeOnDelete();
                $table->string('client')->nullable(); // UA/IP fingerprint-lite
                $table->timestamp('visited_at')->useCurrent();
                $table->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('package_visits');
    }
};
