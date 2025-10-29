<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            // already have guest_first_name? if not, add it here too.
            if (!Schema::hasColumn('welcome_packages', 'guest_first_name')) {
                $table->string('guest_first_name')->nullable();
            }

            // NEW:
            if (!Schema::hasColumn('welcome_packages', 'guest_email')) {
                $table->string('guest_email')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->dropColumn('guest_email');
            // don't drop guest_first_name unless you added it only in this migration
        });
    }
};
