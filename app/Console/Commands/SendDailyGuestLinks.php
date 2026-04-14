<?php

namespace App\Console\Commands;

use App\Jobs\SendGuestWelcomeEmail;
use App\Models\WelcomePackage;
use App\Models\Property;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendDailyGuestLinks extends Command
{
    protected $signature   = 'hostflows:send-guest-links';
    protected $description = 'Send welcome email to guests checking in today (Pro plan hosts only)';

    public function handle(): int
    {
        $today = Carbon::today()->toDateString();

        // Find all packages: check-in is today, published, auto_send on, not yet sent
        $packages = WelcomePackage::with('property.user')
            ->where('check_in_date', $today)
            ->where('is_published', true)
            ->where('auto_send', true)
            ->whereNull('sent_at')
            ->whereNotNull('guest_email')
            ->get()
            ->filter(fn($pkg) => in_array($pkg->property?->user?->plan, ['host', 'growth', 'pro', 'agency']));

        $count = 0;
        foreach ($packages as $pkg) {
            SendGuestWelcomeEmail::dispatch($pkg);
            $count++;
        }

        $this->info("Dispatched {$count} guest welcome email(s) for {$today}.");
        return Command::SUCCESS;
    }
}
