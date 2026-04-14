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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 40)->nullable()->after('email');
            $table->string('business_name')->nullable()->after('name');
            $table->string('host_display_name')->nullable()->after('business_name');
            $table->text('profile_bio')->nullable()->after('host_display_name');
            $table->string('brand_logo_path')->nullable()->after('profile_bio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'business_name',
                'host_display_name',
                'profile_bio',
                'brand_logo_path',
            ]);
        });
    }
};
