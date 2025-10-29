<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->date('check_in_date')->nullable()->after('slug');
            $table->date('check_out_date')->nullable()->after('check_in_date');
        });
        // (optional) keep existing property time fields for now; we’ll ignore them in UI
    }

    public function down(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->dropColumn(['check_in_date','check_out_date']);
        });
    }
};
