<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->foreignId('welcome_package_id')
                ->nullable()
                ->after('property_id')
                ->constrained('welcome_packages')
                ->nullOnDelete();

            $table->string('reported_by_guest_name')->nullable()->after('welcome_package_id');
            $table->string('reported_by_guest_email')->nullable()->after('reported_by_guest_name');
            $table->string('guest_phone')->nullable()->after('reported_by_guest_email');
            $table->string('location_in_property')->nullable()->after('guest_phone');
            $table->string('category')->nullable()->after('location_in_property');
            $table->timestamp('submitted_at')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('welcome_package_id');
            $table->dropColumn([
                'reported_by_guest_name',
                'reported_by_guest_email',
                'guest_phone',
                'location_in_property',
                'category',
                'submitted_at',
            ]);
        });
    }
};