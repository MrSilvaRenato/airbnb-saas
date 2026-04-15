<?php
namespace App\Http\Controllers;

use App\Models\WelcomePackage;
use App\Models\MaintenanceTask;
use Illuminate\Http\Request;

class GuestMaintenanceController extends Controller
{
    public function store(Request $request, $slug)
    {
        $package = WelcomePackage::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => 'required|in:low,medium,high,urgent',
            'category'    => 'nullable|string',
            'location'    => 'nullable|string',
            'guest_name'  => 'nullable|string',
            'guest_email' => 'required|email',
            'guest_phone' => 'nullable|string',
        ]);

        MaintenanceTask::create([
            'property_id'              => $package->property_id,
            'welcome_package_id'       => $package->id,
            'title'                    => $validated['title'],
            'description'              => $validated['description'],
            'priority'                 => $validated['priority'],
            'status'                   => 'open',

            'category'                 => $validated['category'] ?? null,
            'location_in_property'     => $validated['location'] ?? null,

            'reported_by_guest_name'   => $validated['guest_name'] ?? null,
            'reported_by_guest_email'  => $validated['guest_email'],
            'guest_phone'              => $validated['guest_phone'] ?? null,

            'submitted_at'             => now(),
        ]);

                \App\Models\Activity::create([
            'user_id'      => $package->property->user_id,
            'action'       => 'guest_maintenance_reported',
            'subject_type' => \App\Models\MaintenanceTask::class,
            'subject_id'   => $task->id,
            'title'        => 'New guest maintenance request received',
            'meta'         => json_encode([
                'package_id'   => $package->id,
                'property_id'  => $package->property_id,
                'property'     => $package->property->title ?? null,
                'guest_name'   => $validated['guest_name'] ?? $package->guest_first_name,
                'guest_email'  => $validated['guest_email'],
                'priority'     => $validated['priority'],
                'category'     => $validated['category'] ?? null,
                'issue_title'  => $validated['title'],
            ]),
        ]);

        return back()->with('success', 'Issue reported successfully');
    }
}