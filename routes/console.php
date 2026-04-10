<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Send guest welcome emails to guests checking in today (08:00 AEST = 22:00 UTC)
Schedule::command('hostflows:send-guest-links')->dailyAt('22:00');
