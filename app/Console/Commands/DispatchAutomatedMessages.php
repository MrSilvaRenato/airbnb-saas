<?php

namespace App\Console\Commands;

use App\Models\MessageTemplate;
use App\Models\WelcomePackage;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class DispatchAutomatedMessages extends Command
{
    protected $signature = 'hostflows:dispatch-automated-messages';
    protected $description = 'Send automated guest emails based on template rules';

    public function handle(): int
    {
        $now = now();

        $packages = WelcomePackage::with('property.user')
            ->where('is_published', true)
            ->where('auto_send', true)
            ->whereNotNull('guest_email')
            ->whereDate('check_in_date', '<=', $now->copy()->addDays(2)->toDateString())
            ->whereDate('check_out_date', '>=', $now->copy()->subDay()->toDateString())
            ->get();

        $sent = 0;

        foreach ($packages as $package) {
            $user = $package->property?->user;
            if (!$user || !in_array($user->plan, ['pro', 'host', 'admin'], true)) {
                continue;
            }

            $templates = MessageTemplate::where('user_id', $user->id)->where('is_enabled', true)->get();
            if ($templates->isEmpty()) {
                continue;
            }

            foreach ($templates as $template) {
                if (!$this->isDue($template->key, $package, $now)) {
                    continue;
                }

                $alreadySent = DB::table('automated_message_logs')
                    ->where('package_id', $package->id)
                    ->where('template_id', $template->id)
                    ->exists();

                if ($alreadySent) {
                    continue;
                }

                $subject = $this->renderTemplate($template->subject, $package);
                $body = $this->renderTemplate($template->body, $package);

                try {
                    Mail::raw($body, function ($message) use ($package, $subject) {
                        $message->to($package->guest_email)->subject($subject);
                    });

                    DB::table('automated_message_logs')->insert([
                        'package_id' => $package->id,
                        'template_id' => $template->id,
                        'sent_at' => now(),
                        'status' => 'sent',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $sent++;
                } catch (\Throwable $e) {
                    DB::table('automated_message_logs')->insert([
                        'package_id' => $package->id,
                        'template_id' => $template->id,
                        'status' => 'failed',
                        'error' => mb_substr($e->getMessage(), 0, 1000),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        $this->info("Automated emails sent: {$sent}");
        return self::SUCCESS;
    }

    private function isDue(string $key, WelcomePackage $package, Carbon $now): bool
    {
        $checkIn = Carbon::parse($package->check_in_date);
        $checkOut = Carbon::parse($package->check_out_date);

        return match ($key) {
            'booking_confirmed' => $package->created_at && $package->created_at->lte($now->copy()->subMinutes(2)),
            'checkin_reminder' => $checkIn->isSameDay($now->copy()->addDays(2)),
            'checkin_day' => $checkIn->isSameDay($now),
            'checkout_reminder' => $checkOut->isSameDay($now->copy()->addDay()),
            default => false,
        };
    }

    private function renderTemplate(string $text, WelcomePackage $package): string
    {
        $host = $package->property?->user;

        $pairs = [
            '{{guest_first_name}}' => $package->guest_first_name ?: 'Guest',
            '{{property}}' => $package->property?->title ?: 'your stay',
            '{{check_in_date}}' => (string) $package->check_in_date,
            '{{check_out_date}}' => (string) $package->check_out_date,
            '{{welcome_url}}' => route('public.package', $package->slug),
            '{{host_name}}' => $host?->name ?: 'Host',
        ];

        return strtr($text, $pairs);
    }
}
