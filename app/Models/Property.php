<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Property extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'address',
        'wifi_name',
        'wifi_password',
        'notes',
         // NEW: allow mass-assign
    'brand_display_name',
    'brand_contact_label',
    'brand_logo_path',
    
       // guest-facing defaults for future stays
        'default_host_phone',
        'default_smart_lock_code',
        'default_arrival_tips',
        'default_parking_info',
        'default_emergency_info',
        'default_rules_summary',
        'default_garbage_recycling',
        'default_appliances_notes',
        'default_safety_notes',
        'default_checkout_list',

    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // The Host / Owner
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // IMPORTANT:
    // We are no longer using hasOne() here.
    // A Property can have MANY WelcomePackages (one per guest stay).
    public function welcomePackages(): HasMany
    {
        return $this->hasMany(WelcomePackage::class);
    }

    public function maintenanceTasks(): HasMany
    {
        return $this->hasMany(MaintenanceTask::class);
    }

    public function icalFeeds(): HasMany
    {
        return $this->hasMany(IcalFeed::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Convenience helpers for dashboard logic
    |--------------------------------------------------------------------------
    |
    | These helpers let us easily pull:
    | - the stay happening right now
    | - the next upcoming stay
    | - the last few past stays
    |
    | We'll call these in the Host Dashboard controller when we build the data
    | we send to React.
    |
    */

    /**
     * Get the stay that is currently happening (today is between check-in and check-out).
     */
    public function currentPackage()
    {
        $today = Carbon::today();

        return $this->welcomePackages()
            ->whereDate('check_in_date', '<=', $today)
            ->whereDate('check_out_date', '>=', $today)
            ->orderBy('check_in_date', 'asc')
            ->first();
    }

    /**
     * Get the next future stay (the soonest check-in date that is after today).
     */
    public function nextUpcomingPackage()
    {
        $today = Carbon::today();

        return $this->welcomePackages()
            ->whereDate('check_in_date', '>', $today)
            ->orderBy('check_in_date', 'asc')
            ->first();
    }

    /**
     * Get a few most recent past stays (already checked out).
     * We’ll usually show these under "Recent Guests" on the dashboard.
     */
    public function recentPastPackages()
    {
        $today = Carbon::today();

        return $this->welcomePackages()
            ->whereDate('check_out_date', '<', $today)
            ->orderBy('check_in_date', 'desc')
            ->take(3)
            ->get();
    }
}
