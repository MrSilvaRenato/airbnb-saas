<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            // Per-stay & quick actions
            $table->string('guest_first_name')->nullable()->after('check_out_date');
            $table->unsignedSmallInteger('guest_count')->nullable()->after('guest_first_name');
            $table->decimal('price_total', 10, 2)->nullable()->after('guest_count');
            $table->string('host_phone')->nullable()->after('price_total');
            $table->string('smart_lock_code')->nullable()->after('host_phone');

            // High-signal instructions (long-form text shown in sections)
            $table->text('arrival_tips')->nullable()->after('smart_lock_code');       // “how to find it”, entry point
            $table->text('parking_info')->nullable()->after('arrival_tips');          // permits, height limits, bay #
            $table->text('emergency_info')->nullable()->after('parking_info');        // emergency contacts + nearest hospital
            $table->text('rules_summary')->nullable()->after('emergency_info');       // top 5 rules (no parties, quiet hours, pets, smoking, visitors)
            $table->text('garbage_recycling')->nullable()->after('rules_summary');    // bin locations, days, sorting
            $table->text('appliances_notes')->nullable()->after('garbage_recycling'); // stove/oven/coffee/TV/laundry quick-tips
            $table->text('safety_notes')->nullable()->after('appliances_notes');      // alarms, extinguishers, hazards
            $table->text('checkout_list')->nullable()->after('safety_notes');         // quick checklist
        });
    }

    public function down(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->dropColumn([
                'guest_first_name','guest_count','price_total','host_phone','smart_lock_code',
                'arrival_tips','parking_info','emergency_info','rules_summary',
                'garbage_recycling','appliances_notes','safety_notes','checkout_list',
            ]);
        });
    }
};
