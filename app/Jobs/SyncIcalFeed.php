<?php

namespace App\Jobs;

use App\Models\IcalFeed;
use App\Models\WelcomePackage;
use ICal\ICal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class SyncIcalFeed implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(public IcalFeed $feed) {}

    public function handle(): void
    {
        try {
            $ical = new ICal($this->feed->url, [
                'defaultSpan'                 => 2,
                'defaultTimeZone'             => 'UTC',
                'skipRecurrence'              => true,
                'disableCharacterReplacement' => true,
                'filterDaysAfter'             => 365,
                'filterDaysBefore'            => 30,
            ]);

            $property   = $this->feed->property;
            $existingUids = WelcomePackage::where('property_id', $property->id)
                ->whereNotNull('ical_uid')
                ->pluck('ical_uid')
                ->flip();

            foreach ($ical->events() as $event) {
                $uid     = $event->uid ?? null;
                $summary = $event->summary ?? 'Guest Stay';
                $status  = strtoupper($event->status ?? 'CONFIRMED');

                if (!$uid) continue;

                // Parse dates
                $checkIn  = $ical->iCalDateToDateTime($event->dtstart);
                $checkOut = $ical->iCalDateToDateTime($event->dtend);

                // Skip past events (ended more than 30 days ago)
                if ($checkOut < now()->subDays(30)) continue;

                // Extract guest name from summary (Airbnb format: "Firstname (Reserved)")
                $guestName = preg_replace('/\s*\(.*?\)/', '', $summary);
                $guestName = trim($guestName) ?: 'Guest';

                // Blocked/unavailable — skip
                if (in_array(strtolower($guestName), ['blocked', 'airbnb', 'unavailable', 'vrbo', 'homeaway'])) {
                    continue;
                }

                $existing = WelcomePackage::where('property_id', $property->id)
                    ->where('ical_uid', $uid)
                    ->first();

                if ($status === 'CANCELLED') {
                    // Cancel the stay if it exists
                    $existing?->update(['status' => 'cancelled']);
                    continue;
                }

                $data = [
                    'property_id'      => $property->id,
                    'ical_uid'         => $uid,
                    'ical_source'      => $this->detectSource($this->feed->url),
                    'guest_first_name' => $guestName,
                    'check_in_date'    => $checkIn->format('Y-m-d'),
                    'check_out_date'   => $checkOut->format('Y-m-d'),
                    'status'           => 'draft',
                    // Pre-fill defaults from property
                    'host_phone'            => $property->default_host_phone,
                    'smart_lock_code'       => $property->default_smart_lock_code,
                    'arrival_tips'          => $property->default_arrival_tips,
                    'parking_info'          => $property->default_parking_info,
                    'emergency_info'        => $property->default_emergency_info,
                    'rules_summary'         => $property->default_rules_summary,
                    'garbage_recycling'     => $property->default_garbage_recycling,
                    'appliances_notes'      => $property->default_appliances_notes,
                    'safety_notes'          => $property->default_safety_notes,
                    'checkout_list'         => $property->default_checkout_list,
                ];

                if ($existing) {
                    // Update dates/status only — don't overwrite host edits
                    $existing->update([
                        'check_in_date'  => $data['check_in_date'],
                        'check_out_date' => $data['check_out_date'],
                        'guest_first_name' => $existing->guest_first_name ?: $guestName,
                    ]);
                } else {
                    $data['slug']         = Str::uuid();
                    $data['is_published'] = false;
                    WelcomePackage::create($data);
                }
            }

            $this->feed->update([
                'last_synced_at'    => now(),
                'last_sync_status'  => 'ok',
            ]);

        } catch (\Throwable $e) {
            $this->feed->update([
                'last_synced_at'   => now(),
                'last_sync_status' => 'Error: ' . substr($e->getMessage(), 0, 480),
            ]);

            throw $e;
        }
    }

    private function detectSource(string $url): string
    {
        if (str_contains($url, 'airbnb')) return 'airbnb';
        if (str_contains($url, 'vrbo') || str_contains($url, 'homeaway')) return 'vrbo';
        return 'ical';
    }
}
