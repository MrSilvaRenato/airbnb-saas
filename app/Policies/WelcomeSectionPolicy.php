<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WelcomeSection;

class WelcomeSectionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WelcomeSection $section): bool
    {
        return $section->package
            && $section->package->property
            && $section->package->property->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, WelcomeSection $section): bool
    {
        return $section->package
            && $section->package->property
            && $section->package->property->user_id === $user->id;
    }

    public function delete(User $user, WelcomeSection $section): bool
    {
        return $section->package
            && $section->package->property
            && $section->package->property->user_id === $user->id;
    }

    public function reorder(User $user, WelcomeSection $section): bool
    {
        // Optional custom ability for drag/drop
        return $this->update($user, $section);
    }
}
