<?php

namespace App\Http\Controllers;

use App\Jobs\SyncIcalFeed;
use App\Models\IcalFeed;
use App\Models\Property;
use Illuminate\Http\Request;

class IcalFeedController extends Controller
{
    public function store(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $request->validate(['url' => 'required|url|max:2000']);

        $feed = $property->icalFeeds()->updateOrCreate(
            ['property_id' => $property->id],
            ['url' => $request->url, 'last_sync_status' => null, 'last_synced_at' => null]
        );

        SyncIcalFeed::dispatch($feed);

        return back()->with('success', 'iCal feed saved. Syncing in the background…');
    }

    public function sync(Property $property)
    {
        $this->authorize('update', $property);

        $feed = $property->icalFeeds()->first();
        if (!$feed) return back()->with('error', 'No iCal feed configured.');

        SyncIcalFeed::dispatch($feed);

        return back()->with('success', 'Sync started — check back in a moment.');
    }

    public function destroy(Property $property)
    {
        $this->authorize('update', $property);

        $property->icalFeeds()->delete();

        return back()->with('success', 'iCal feed removed.');
    }
}
