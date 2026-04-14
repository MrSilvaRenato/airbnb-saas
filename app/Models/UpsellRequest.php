<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UpsellRequest extends Model
{
    protected $fillable = [
        'upsell_offer_id', 'welcome_package_id',
        'guest_email', 'guest_name', 'message', 'status', 'host_notified_at',
    ];

    protected $casts = [
        'host_notified_at' => 'datetime',
    ];

    public function offer()   { return $this->belongsTo(UpsellOffer::class, 'upsell_offer_id'); }
    public function package() { return $this->belongsTo(WelcomePackage::class, 'welcome_package_id'); }
}
