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
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->string('ical_uid')->nullable()->after('slug');
            $table->string('ical_source')->nullable()->after('ical_uid'); // 'airbnb'|'vrbo'|'manual'
        });
    }

    public function down(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->dropColumn(['ical_uid', 'ical_source']);
        });
    }
};
