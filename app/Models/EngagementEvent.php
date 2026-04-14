<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EngagementEvent extends Model
{
    // Append-only — only created_at, no updated_at
    public $timestamps = false;

    protected $fillable = [
        'welcome_package_id',
        'welcome_section_id',
        'session_token',
        'event_type',
        'duration_seconds',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function welcomePackage()
    {
        return $this->belongsTo(WelcomePackage::class);
    }

    public function welcomeSection()
    {
        return $this->belongsTo(WelcomeSection::class);
    }
}
