<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('brand_display_name')->nullable()->after('notes');
            $table->string('brand_contact_label')->nullable()->after('brand_display_name');
            $table->string('brand_logo_path')->nullable()->after('brand_contact_label');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'brand_display_name',
                'brand_contact_label',
                'brand_logo_path',
            ]);
        });
    }
};
