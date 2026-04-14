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
        abort_unless(in_array($request->user()->plan, ['host', 'growth', 'pro', 'agency']), 403);

        $request->validate(['url' => 'required|url|max:2000']);

        $feed = $property->icalFeeds()->updateOrCreate(
            ['property_id' => $property->id],
            ['url' => $request->url, 'last_sync_status' => null, 'last_synced_at' => null]
        );

        SyncIcalFeed::dispatch($feed);

        return back()->with('success', 'iCal feed saved. Syncing in the background…');
    }

    public function sync(Request $request, Property $property)
    {
        $this->authorize('update', $property);
        abort_unless(in_array($request->user()->plan, ['host', 'growth', 'pro', 'agency']), 403);

        $feed = $property->icalFeeds()->first();
        if (!$feed) return back()->with('error', 'No iCal feed configured.');

        SyncIcalFeed::dispatch($feed);

        return back()->with('success', 'Sync started — check back in a moment.');
    }

    public function destroy(Request $request, Property $property)
    {
        $this->authorize('update', $property);
        abort_unless(in_array($request->user()->plan, ['host', 'growth', 'pro', 'agency']), 403);

        $property->icalFeeds()->delete();

        return back()->with('success', 'iCal feed removed.');
    }
}
