<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Hosts can list their own properties (filter in controller)
    }

    public function view(User $user, Property $property): bool
    {
        return $property->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        // If you gate by subscription later, check here too.
        return true;
    }

    public function update(User $user, Property $property): bool
    {
        return $property->user_id === $user->id;
    }

    public function delete(User $user, Property $property): bool
    {
        return $property->user_id === $user->id;
    }
}
