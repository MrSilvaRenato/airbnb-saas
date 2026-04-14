<?php

namespace App\Services;

use App\Models\MessageTemplate;
use App\Models\ScheduledMessage;
use App\Models\WelcomePackage;
use Carbon\Carbon;

class MessageScheduler
{
    public function scheduleForPackage(WelcomePackage $package): void
    {
        if (!$package->guest_email || !$package->check_in_date) return;

        $property = $package->property;
        $host     = $property->user;
        $link     = url('/p/' . $package->slug);

        // Get templates: property-specific first, then user-wide
        $templates = MessageTemplate::where('user_id', $host->id)
            ->where('enabled', true)
            ->where(fn($q) => $q->where('property_id', $property->id)->orWhereNull('property_id'))
            ->orderByRaw('property_id IS NULL ASC') // property-specific takes priority
            ->get()
            ->unique('trigger'); // one per trigger

        if ($templates->isEmpty()) {
            // Seed defaults for this user on first use
            foreach (MessageTemplate::defaults($host->id) as $def) {
                $templates->push(MessageTemplate::create(array_merge($def, ['user_id' => $host->id])));
            }
        }

        $checkIn  = Carbon::parse($package->check_in_date)->startOfDay();
        $checkOut = Carbon::parse($package->check_out_date)->startOfDay();

        foreach ($templates as $template) {
            $sendAt = match($template->trigger) {
                'booking_confirmed'  => now()->addMinutes(2), // near-immediate
                'checkin_reminder'   => $checkIn->copy()->addHours($template->send_offset_hours), // e.g. -48h
                'checkin_day'        => $checkIn->copy()->setTime(8, 0),
                'checkout_reminder'  => $checkOut->copy()->addHours($template->send_offset_hours), // e.g. -12h
                default              => null,
            };

            if (!$sendAt || $sendAt->isPast()) continue;

            $rendered = $template->render($package, $link);

            // Avoid duplicate scheduling
            ScheduledMessage::updateOrCreate(
                ['welcome_package_id' => $package->id, 'trigger' => $template->trigger],
                [
                    'message_template_id' => $template->id,
                    'recipient_email'     => $package->guest_email,
                    'subject'             => $rendered['subject'],
                    'body'                => $rendered['body'],
                    'send_at'             => $sendAt,
                    'status'              => 'pending',
                    'sent_at'             => null,
                    'error'               => null,
                ]
            );
        }
    }

    public function cancelForPackage(WelcomePackage $package): void
    {
        ScheduledMessage::where('welcome_package_id', $package->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }
}
