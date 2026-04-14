<?php

namespace App\Http\Controllers;

use App\Models\EngagementEvent;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    /**
     * Public endpoint — receives batched engagement events from the guest page.
     * No authentication required. Uses insert() for efficiency.
     */
    public function track(Request $request)
    {
        $data = $request->validate([
            'welcome_package_id'              => 'required|exists:welcome_packages,id',
            'session_token'                   => 'required|string|max:40',
            'events'                          => 'required|array|max:50',
            'events.*.event_type'             => 'required|in:guide_open,section_view,section_expand',
            'events.*.welcome_section_id'     => 'nullable|exists:welcome_sections,id',
            'events.*.duration_seconds'       => 'nullable|integer|min:0|max:3600',
        ]);

        $now  = now();
        $rows = array_map(fn($e) => [
            'welcome_package_id' => $data['welcome_package_id'],
            'session_token'      => $data['session_token'],
            'welcome_section_id' => $e['welcome_section_id'] ?? null,
            'event_type'         => $e['event_type'],
            'duration_seconds'   => $e['duration_seconds'] ?? null,
            'created_at'         => $now,
        ], $data['events']);

        EngagementEvent::insert($rows);

        return response()->json(['ok' => true]);
    }
}
