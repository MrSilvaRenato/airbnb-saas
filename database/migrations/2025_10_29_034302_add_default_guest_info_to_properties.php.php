<?php

// database/migrations/2025_10_29_XXXXXX_add_default_guest_info_to_properties.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('default_host_phone', 40)->nullable();
            $table->string('default_smart_lock_code', 100)->nullable();

            $table->text('default_arrival_tips')->nullable();
            $table->text('default_parking_info')->nullable();
            $table->text('default_emergency_info')->nullable();
            $table->text('default_rules_summary')->nullable();
            $table->text('default_garbage_recycling')->nullable();
            $table->text('default_appliances_notes')->nullable();
            $table->text('default_safety_notes')->nullable();
            $table->text('default_checkout_list')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'default_host_phone',
                'default_smart_lock_code',
                'default_arrival_tips',
                'default_parking_info',
                'default_emergency_info',
                'default_rules_summary',
                'default_garbage_recycling',
                'default_appliances_notes',
                'default_safety_notes',
                'default_checkout_list',
            ]);
        });
    }
};
