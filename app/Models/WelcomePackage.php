<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class WelcomePackage extends Model
{
protected $fillable = [
  'property_id',
        'slug',
        'ical_uid',
        'ical_source',
        'is_published',
        'qr_code_path',

        'check_in_date',
        'check_out_date',

        'guest_first_name',
        'guest_email',
        'guest_phone',
        'guest_count',

        'price_total',
        'status',

        // per-stay overrides for guest-facing info
        'host_phone',
        'smart_lock_code',
        'arrival_tips',
        'parking_info',
        'emergency_info',
        'rules_summary',
        'garbage_recycling',
        'appliances_notes',
        'safety_notes',
        'checkout_list',

        // auto-communication
        'sent_at',
        'auto_send',
];


    public function property() { return $this->belongsTo(Property::class); }
    public function sections() { return $this->hasMany(WelcomeSection::class)->orderBy('sort_order'); }
    public function visits() { return $this->hasMany(PackageVisit::class); }

    public function statusLabel(): string
    {
        $today = Carbon::today();
        $inDays = $today->diffInDays(Carbon::parse($this->check_in_date), false);

        if ($today->lt(Carbon::parse($this->check_in_date))) {
            return $inDays <= 0 ? 'Upcoming' : 'Starts in '.$inDays.' days';
        }
        if ($today->between(Carbon::parse($this->check_in_date), Carbon::parse($this->check_out_date))) {
            return 'Ongoing';
        }
        return 'Ended';
    }
}
