<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageTemplate extends Model
{
    protected $fillable = [
        'user_id', 'property_id', 'trigger', 'send_offset_hours',
        'subject', 'body', 'enabled',
    ];

    protected $casts = ['enabled' => 'boolean'];

    public function user()     { return $this->belongsTo(User::class); }
    public function property() { return $this->belongsTo(Property::class); }

    // Replace {{variables}} with actual values
    public function render(WelcomePackage $package, string $link): array
    {
        $property = $package->property;
        $vars = [
            '{{guest_name}}'  => $package->guest_first_name ?? 'Guest',
            '{{property}}'    => $property->title ?? '',
            '{{checkin}}'     => $package->check_in_date ? \Carbon\Carbon::parse($package->check_in_date)->format('D d M Y') : '',
            '{{checkout}}'    => $package->check_out_date ? \Carbon\Carbon::parse($package->check_out_date)->format('D d M Y') : '',
            '{{link}}'        => $link,
            '{{host_name}}'   => $property->user->name ?? 'Your Host',
            '{{wifi_name}}'   => $package->wifi_name ?? $property->wifi_name ?? '',
            '{{wifi_pass}}'   => $package->wifi_password ?? $property->wifi_password ?? '',
            '{{smart_lock}}'  => $package->smart_lock_code ?? $property->default_smart_lock_code ?? '',
        ];
        return [
            'subject' => strtr($this->subject, $vars),
            'body'    => strtr($this->body, $vars),
        ];
    }

    // Default templates for a new user
    public static function defaults(int $userId): array
    {
        return [
            [
                'trigger'           => 'booking_confirmed',
                'send_offset_hours' => 0,
                'subject'           => 'Your welcome guide for {{property}} is ready 🏡',
                'body'              => "Hi {{guest_name}},\n\nGreat news! Your welcome guide for {{property}} is ready.\n\nAccess everything you need for your stay here:\n{{link}}\n\nCheck-in: {{checkin}}\nCheck-out: {{checkout}}\n\nSee you soon!\n{{host_name}}",
            ],
            [
                'trigger'           => 'checkin_reminder',
                'send_offset_hours' => -48,
                'subject'           => 'Your stay at {{property}} is in 2 days 🗓',
                'body'              => "Hi {{guest_name}},\n\nJust a reminder — your stay at {{property}} starts on {{checkin}}.\n\nYour welcome guide with all the details is here:\n{{link}}\n\nLet us know if you have any questions.\n\n{{host_name}}",
            ],
            [
                'trigger'           => 'checkin_day',
                'send_offset_hours' => 0,
                'subject'           => 'Welcome! Your check-in guide for {{property}} 🔑',
                'body'              => "Hi {{guest_name}},\n\nWelcome day! We hope your journey is going smoothly.\n\nEverything you need for check-in is in your guide:\n{{link}}\n\nSmart lock code: {{smart_lock}}\nWiFi: {{wifi_name}} / {{wifi_pass}}\n\nEnjoy your stay!\n{{host_name}}",
            ],
            [
                'trigger'           => 'checkout_reminder',
                'send_offset_hours' => -12,
                'subject'           => 'Checkout tomorrow — a few things to remember 🧹',
                'body'              => "Hi {{guest_name}},\n\nJust a reminder that checkout is tomorrow ({{checkout}}).\n\nPlease check the checkout instructions in your guide:\n{{link}}\n\nThank you for staying with us. We hope you had a wonderful time!\n\n{{host_name}}",
            ],
        ];
    }
}
