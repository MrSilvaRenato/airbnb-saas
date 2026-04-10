<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add notification columns to package_visits
        Schema::table('package_visits', function (Blueprint $table) {
            if (!Schema::hasColumn('package_visits', 'ip')) {
                $table->string('ip', 45)->nullable()->after('client');
            }
            if (!Schema::hasColumn('package_visits', 'user_agent')) {
                $table->text('user_agent')->nullable()->after('ip');
            }
            if (!Schema::hasColumn('package_visits', 'host_notified_at')) {
                $table->timestamp('host_notified_at')->nullable()->after('visited_at');
            }
        });

        // Add notification preference to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'notify_on_guest_view')) {
                $table->boolean('notify_on_guest_view')->default(false)->after('onboarding_skipped_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('package_visits', function (Blueprint $table) {
            $table->dropColumn(array_filter(
                ['ip', 'user_agent', 'host_notified_at'],
                fn($col) => Schema::hasColumn('package_visits', $col)
            ));
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'notify_on_guest_view')) {
                $table->dropColumn('notify_on_guest_view');
            }
        });
    }
};
