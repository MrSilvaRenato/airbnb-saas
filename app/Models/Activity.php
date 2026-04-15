<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

class Activity extends Model
{
    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id', 'title', 'meta',
        
    ];

    protected $casts = [
        'meta' => AsArrayObject::class,
    ];

    public function subject()
    {
        return $this->morphTo();
    }

    /* Convenience */
    public static function record($user, $subject, string $action, ?string $title=null, array $meta=[])
    {
        return static::create([
            'user_id'      => $user->id,
            'action'       => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id'   => $subject?->id,
            'title'        => $title,
            'meta'         => $meta,
            
        ]);
    }

    /* Query scope */
    public function scopeForUser($q, int $userId)
    {
        return $q->where('user_id', $userId);
    }
}
