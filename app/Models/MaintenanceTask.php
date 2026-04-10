<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceTask extends Model
{
    protected $fillable = [
        'property_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'resolved_at',
        'notes',
    ];

    protected $casts = [
        'due_date'    => 'date',
        'resolved_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'resolved')
                     ->whereNotNull('due_date')
                     ->whereDate('due_date', '<', now());
    }
}
