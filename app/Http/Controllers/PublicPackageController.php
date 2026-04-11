<?php

namespace App\Http\Controllers;

use App\Models\WelcomePackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPackageController extends Controller
{
    public function show(WelcomePackage $package) // route uses {package:slug}
    {
        // Log a visit for analytics
        $visit = $package->visits()->create([
            'visited_at' => now(),
            'ip'         => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Notify host if opted in — debounce: once per 2h per package
        try {
            $package->load('property.user');
            $host = $package->property?->user;
            if ($host && $host->notify_on_guest_view) {
                $alreadyNotified = $package->visits()
                    ->whereNotNull('host_notified_at')
                    ->where('host_notified_at', '>=', now()->subHours(2))
                    ->exists();
                if (!$alreadyNotified) {
                    \Illuminate\Support\Facades\Mail::to($host->email)
                        ->send(new \App\Mail\GuestViewedPackage($package));
                    $visit->update(['host_notified_at' => now()]);
                }
            }
        } catch (\Throwable $e) {
            // never break guest page for notification failure
        }

        // Eager-load property (+user so we can see plan) and ordered sections.
        // IMPORTANT: include all the default_* cols so we can fall back.
        $package->load([
            'property' => function ($q) {
                $q->select(
                    'id',
                    'user_id',
                    'title',
                    'address',
                    'wifi_name',
                    'wifi_password',

                    // defaults used for guest-facing info when stay override is empty
                    'default_host_phone',
                    'default_smart_lock_code',
                    'default_arrival_tips',
                    'default_parking_info',
                    'default_emergency_info',
                    'default_rules_summary',
                    'default_garbage_recycling',
                    'default_appliances_notes',
                    'default_safety_notes',
                    'default_checkout_list',

                    // branding fields
                    'brand_display_name',
                    'brand_contact_label',
                    'brand_logo_path'
                )->with([
                    'user:id,plan', // just need plan
                ]);
            },
            'sections' => function ($q) {
                $q->orderBy('sort_order');
            },
        ]);

        $prop  = $package->property;
        $owner = $prop?->user;

        // helper: prefer stay override if it's non-empty; otherwise use property's default_*
        $withFallback = function ($stayValue, $propertyValue) {
            if (isset($stayValue) && trim((string) $stayValue) !== '') {
                return $stayValue;
            }
            return $propertyValue ?? '';
        };

        // Branding block – only if host is pro
        $branding = [
            'display_name'  => null,
            'contact_label' => null,
            'logo_url'      => null,
        ];

        if ($owner && $owner->plan === 'pro') {
            $branding = [
                'display_name'  => $prop->brand_display_name,
                'contact_label' => $prop->brand_contact_label,
                'logo_url'      => $prop->brand_logo_path
                    ? asset($prop->brand_logo_path)
                    : null,
            ];
        }

        // Build pkg payload exactly how Public/Package.jsx expects it
        $pkg = [
            // presentation / header
            'title'            => $prop->title ?? '',
            'address'          => $prop->address ?? '',

            // stay meta
            'check_in_date'    => $package->check_in_date    ?? '',
            'check_out_date'   => $package->check_out_date   ?? '',
            'guest_first_name' => $package->guest_first_name ?? '',
            'guest_count'      => $package->guest_count      ?? '',
            'price_total'      => $package->price_total      ?? '',

            // we still expose these individually if you want them later
            'arrival_instructions' => $withFallback(
                $package->arrival_tips,
                $prop->default_arrival_tips
            ),
            'emergency_info'       => $withFallback(
                $package->emergency_info,
                $prop->default_emergency_info
            ),

            // quick actions block used in Public/Package.jsx
            'quick' => [
                'wifi_name'         => $prop->wifi_name      ?? '',
                'wifi_password'     => $prop->wifi_password  ?? '',

                // ✅ merged host phone, with fallback to property default_host_phone
                'host_phone'        => $withFallback(
                    $package->host_phone,
                    $prop->default_host_phone
                ),

                // ✅ merged smart lock code, fallback to property default_smart_lock_code
                'smart_lock_code'   => $withFallback(
                    $package->smart_lock_code,
                    $prop->default_smart_lock_code
                ),

                'check_in_date'     => $package->check_in_date    ?? '',
                'check_out_date'    => $package->check_out_date   ?? '',

                // for completeness if you ever want to show these in quick cards:
                'arrival_instructions' => $withFallback(
                    $package->arrival_tips,
                    $prop->default_arrival_tips
                ),
                'emergency_info'       => $withFallback(
                    $package->emergency_info,
                    $prop->default_emergency_info
                ),
            ],

            // rich content sections that render as collapsibles
            'sections' => $package->sections->map(function ($s) {
                return [
                    'id'         => $s->id,
                    'type'       => $s->type,
                    'title'      => $s->title,
                    'body'       => $s->body,
                    'sort_order' => $s->sort_order,
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Public/Package', [
            'pkg'       => $pkg,
            'branding'  => $branding,
        ]);
    }
}

