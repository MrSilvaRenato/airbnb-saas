<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('engagement_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('welcome_package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('welcome_section_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token', 40)->index();
            $table->string('event_type', 30); // guide_open | section_view | section_expand
            $table->unsignedSmallInteger('duration_seconds')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engagement_events');
    }
};
