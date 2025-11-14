<?php

namespace App\Providers;

use App\Models\Property;
use App\Models\WelcomePackage;
use App\Models\WelcomeSection;
use App\Policies\PropertyPolicy;
use App\Policies\WelcomePackagePolicy;
use App\Policies\WelcomeSectionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Property::class => PropertyPolicy::class,
        WelcomePackage::class => WelcomePackagePolicy::class,
        WelcomeSection::class => WelcomeSectionPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
