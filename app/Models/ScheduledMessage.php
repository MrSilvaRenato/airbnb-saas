<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledMessage extends Model
{
    protected $fillable = [
        'welcome_package_id', 'message_template_id', 'trigger',
        'recipient_email', 'subject', 'body', 'send_at', 'sent_at', 'status', 'error',
    ];

    protected $casts = [
        'send_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function package()  { return $this->belongsTo(WelcomePackage::class, 'welcome_package_id'); }
    public function template() { return $this->belongsTo(MessageTemplate::class, 'message_template_id'); }
}
