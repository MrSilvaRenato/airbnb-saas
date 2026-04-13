<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IcalFeed extends Model
{
    protected $fillable = ['property_id', 'url', 'last_synced_at', 'last_sync_status'];

    protected $casts = ['last_synced_at' => 'datetime'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
