<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PackageVisit extends Model {
    protected $fillable = [
        'welcome_package_id',
        'client',
        'visited_at',
        'ip',
        'user_agent',
        'host_notified_at',
    ];

    protected $casts = [
        'visited_at'        => 'datetime',
        'host_notified_at'  => 'datetime',
    ];

    public function package(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(WelcomePackage::class, 'welcome_package_id');
    }

    /** Alias so middleware can use ->welcomePackage relationship name */
    public function welcomePackage(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(WelcomePackage::class, 'welcome_package_id');
    }
}
