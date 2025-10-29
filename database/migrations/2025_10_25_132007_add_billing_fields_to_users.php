<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // plan fields
            $table->string('plan', 20)->default('free')->after('role');
            $table->unsignedInteger('properties_limit_override')->nullable()->after('plan');

            // stripe sync fields
            $table->string('stripe_customer_id')->nullable()->after('properties_limit_override');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            $table->string('stripe_status')->nullable()->after('stripe_subscription_id');
            $table->timestamp('plan_renews_at')->nullable()->after('stripe_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'plan',
                'properties_limit_override',
                'stripe_customer_id',
                'stripe_subscription_id',
                'stripe_status',
                'plan_renews_at',
            ]);
        });
    }
};


