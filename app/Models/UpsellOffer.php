<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UpsellOffer extends Model
{
    protected $fillable = ['property_id', 'title', 'description', 'price', 'enabled', 'sort_order'];

    protected $casts = [
        'enabled' => 'boolean',
        'price'   => 'decimal:2',
    ];

    public function property()  { return $this->belongsTo(Property::class); }
    public function requests()  { return $this->hasMany(UpsellRequest::class); }
}
