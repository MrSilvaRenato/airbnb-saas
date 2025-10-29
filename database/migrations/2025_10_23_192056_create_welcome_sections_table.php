<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('welcome_sections')) {
            Schema::create('welcome_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('welcome_package_id')->constrained()->cascadeOnDelete();
                $table->string('type');             // info|house_rule|guide|faq|contact|map_pin...
                $table->string('title');
                $table->longText('body')->nullable();
                $table->unsignedInteger('sort_order')->default(1);
                $table->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('welcome_sections');
    }
};
