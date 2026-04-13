<?php

namespace App\Console\Commands;

use App\Jobs\SyncIcalFeed;
use App\Models\IcalFeed;
use Illuminate\Console\Command;

class SyncAllIcalFeeds extends Command
{
    protected $signature   = 'ical:sync {--feed= : Sync a specific feed ID}';
    protected $description = 'Sync all iCal feeds and auto-create stays from bookings';

    public function handle(): void
    {
        $query = IcalFeed::query();

        if ($id = $this->option('feed')) {
            $query->where('id', $id);
        }

        $feeds = $query->get();

        if ($feeds->isEmpty()) {
            $this->info('No iCal feeds found.');
            return;
        }

        foreach ($feeds as $feed) {
            $this->info("Syncing feed #{$feed->id} for property #{$feed->property_id}...");
            SyncIcalFeed::dispatch($feed);
        }

        $this->info("Dispatched {$feeds->count()} sync job(s).");
    }
}
