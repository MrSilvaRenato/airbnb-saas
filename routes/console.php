<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Send guest welcome emails to guests checking in today (08:00 AEST = 22:00 UTC)
Schedule::command('hostflows:send-guest-links')->dailyAt('22:00');

// Sync all iCal feeds every 15 minutes
Schedule::command('ical:sync')->everyFifteenMinutes();

// Send scheduled guest messages every minute — runs handle() directly so no
// separate queue worker is required; withoutOverlapping prevents pile-up.
Schedule::call(function () {
    (new \App\Jobs\SendScheduledMessages)->handle();
})->everyMinute()->name('send-scheduled-messages')->withoutOverlapping();
