<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WelcomePackage;

class WelcomePackagePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WelcomePackage $pkg): bool
    {
        // host who owns the package’s property can view
        return $pkg->property && $pkg->property->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, WelcomePackage $pkg): bool
    {
        return $pkg->property && $pkg->property->user_id === $user->id;
    }

    public function delete(User $user, WelcomePackage $pkg): bool
    {
        return $pkg->property && $pkg->property->user_id === $user->id;
    }
}
