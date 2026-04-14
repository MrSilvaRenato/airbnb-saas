<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo')->nullable()->after('email');
            $table->string('tagline', 160)->nullable()->after('profile_photo');
            $table->text('bio')->nullable()->after('tagline');
            $table->string('location', 120)->nullable()->after('bio');
            $table->string('website', 255)->nullable()->after('location');
            // phone may already exist from the previous migration — skip if so
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 40)->nullable()->after('website');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $cols = ['profile_photo', 'tagline', 'bio', 'location', 'website'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
