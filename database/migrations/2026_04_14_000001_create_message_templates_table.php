<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key', 50);
            $table->string('name', 120);
            $table->string('subject', 255);
            $table->text('body');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'key']);
        });

        Schema::create('automated_message_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('welcome_packages')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('message_templates')->cascadeOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->string('status', 20)->default('sent');
            $table->text('error')->nullable();
            $table->timestamps();

            $table->unique(['package_id', 'template_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automated_message_logs');
        Schema::dropIfExists('message_templates');
    }
};
