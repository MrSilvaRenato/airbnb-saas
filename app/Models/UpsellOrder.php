<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UpsellOrder extends Model
{
    protected $fillable = [
        'upsell_offer_id', 'welcome_package_id',
        'guest_email', 'guest_name', 'message',
        'amount', 'commission',
        'stripe_session_id', 'stripe_payment_intent_id',
        'status', 'paid_at', 'host_notified_at',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'commission' => 'decimal:2',
        'paid_at'    => 'datetime',
        'host_notified_at' => 'datetime',
    ];

    public function offer()   { return $this->belongsTo(UpsellOffer::class, 'upsell_offer_id'); }
    public function package() { return $this->belongsTo(WelcomePackage::class, 'welcome_package_id'); }
}
