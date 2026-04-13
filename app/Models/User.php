<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasPushSubscriptions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'business_name',
        'host_display_name',
        'profile_bio',
        'email',
        'phone',
        'brand_logo_path',
        'password',
        'plan',
        'role',
        'onboarding_step',
        'onboarding_skipped_at',
        'notify_on_guest_view',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_status',
        'plan_renews_at',
        'plan_ends_at',
        'subscription_started_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'onboarding_skipped_at'  => 'datetime',
            'notify_on_guest_view'    => 'boolean',
            'plan_renews_at'          => 'datetime',
            'plan_ends_at'            => 'datetime',
            'subscription_started_at' => 'datetime',
        ];
    }

public function properties() { return $this->hasMany(Property::class); }
public function isHost(): bool { return $this->role === 'host' || $this->role === 'admin'; }
public function isTenant(): bool { return $this->role === 'tenant'; }

public function isOnboardingComplete(): bool
{
    return ($this->onboarding_step ?? 0) >= 3 || $this->onboarding_skipped_at !== null;
}

}
