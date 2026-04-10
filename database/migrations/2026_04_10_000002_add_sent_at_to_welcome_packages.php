<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->timestamp('sent_at')->nullable()->after('is_published');
            $table->boolean('auto_send')->default(false)->after('sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('welcome_packages', function (Blueprint $table) {
            $table->dropColumn(['sent_at', 'auto_send']);
        });
    }
};
