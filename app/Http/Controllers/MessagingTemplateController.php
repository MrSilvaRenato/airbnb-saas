<?php

namespace App\Http\Controllers;

use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessagingTemplateController extends Controller
{
    private const DEFAULTS = [
        'booking_confirmed' => [
            'name' => 'Booking Confirmed (sent ~2 min after stay created)',
            'subject' => 'Your welcome guide for {{property}} is ready 🏡',
            'body' => "Hi {{guest_first_name}},\n\nYour stay at {{property}} is confirmed.\n\nYour welcome guide: {{welcome_url}}\n\nSee you soon,\n{{host_name}}",
        ],
        'checkin_reminder' => [
            'name' => 'Check-in Reminder (2 days before check-in)',
            'subject' => 'Your stay at {{property}} is in 2 days 📅',
            'body' => "Hi {{guest_first_name}},\n\nJust a reminder your check-in at {{property}} is on {{check_in_date}}.\n\nGuide: {{welcome_url}}",
        ],
        'checkin_day' => [
            'name' => 'Check-in Day (8 AM on arrival day)',
            'subject' => 'Welcome! Your check-in guide for {{property}} 🔑',
            'body' => "Hi {{guest_first_name}},\n\nWelcome! Your check-in is today.\n\nOpen your guide: {{welcome_url}}",
        ],
        'checkout_reminder' => [
            'name' => 'Check-out Reminder (1 day before check-out)',
            'subject' => 'Checkout reminder for {{property}} 🧹',
            'body' => "Hi {{guest_first_name}},\n\nQuick reminder your checkout is on {{check_out_date}}.\n\nGuide: {{welcome_url}}",
        ],
    ];

    public function index(Request $request)
    {
        $this->ensureDefaults($request->user()->id);

        $templates = MessageTemplate::where('user_id', $request->user()->id)
            ->orderByRaw("CASE `key`
                WHEN 'booking_confirmed' THEN 1
                WHEN 'checkin_reminder' THEN 2
                WHEN 'checkin_day' THEN 3
                WHEN 'checkout_reminder' THEN 4
                ELSE 99 END")
            ->get(['id', 'key', 'name', 'subject', 'body', 'is_enabled']);

        return Inertia::render('Messaging/Templates', [
            'templates' => $templates,
        ]);
    }

    public function edit(Request $request, MessageTemplate $template)
    {
        abort_unless($template->user_id === $request->user()->id, 403);

        return Inertia::render('Messaging/EditTemplate', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, MessageTemplate $template)
    {
        abort_unless($template->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
            'is_enabled' => ['nullable', 'boolean'],
        ]);

        $template->update([
            'subject' => $data['subject'],
            'body' => $data['body'],
            'is_enabled' => (bool)($data['is_enabled'] ?? false),
        ]);

        return redirect()->route('messaging.templates')->with('success', 'Template updated.');
    }

    private function ensureDefaults(int $userId): void
    {
        foreach (self::DEFAULTS as $key => $tpl) {
            MessageTemplate::firstOrCreate(
                ['user_id' => $userId, 'key' => $key],
                [
                    'name' => $tpl['name'],
                    'subject' => $tpl['subject'],
                    'body' => $tpl['body'],
                    'is_enabled' => true,
                ]
            );
        }
    }
}
