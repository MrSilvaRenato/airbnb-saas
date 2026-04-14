<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\WelcomePackage;
use App\Models\WelcomeSection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\Activity;
use App\Services\MessageScheduler;

class WelcomePackageController extends Controller

{
    // =========================
    // Auth helper
    // =========================

public function edit(Request $request, WelcomePackage $package)
{
        $this->authorize('update', $package);
    // 1. auth check (host must own this property or be admin host)
    abort_if(
        $package->property->user_id !== $request->user()->id
        && !$request->user()->isHost(),
        403
    );

    // 2. eager load relationships
    $package->load(['property', 'sections']);
    $prop = $package->property;

    // helper to fall back to property default_* if the stay-specific field is blank
    $withFallback = function ($stayValue, $propertyValue) {
        if (isset($stayValue) && trim((string)$stayValue) !== '') {
            return $stayValue;
        }
        return $propertyValue ?? '';
    };

    // 3. build merged pkg payload
    $pkgForInertia = [
        'id'               => $package->id,

        // property display name/address (top header in Edit.jsx)
        'title'            => $prop->title ?? '',
        'address'          => $prop->address ?? '',

            // stay core info (always from the package row)
            'check_in_date'    => $package->check_in_date    ?? '',
            'check_out_date'   => $package->check_out_date   ?? '',
            'guest_first_name' => $package->guest_first_name ?? '',
            'guest_email'      => $package->guest_email      ?? '',
            'guest_phone'      => $package->guest_phone      ?? '',
            'guest_count'      => $package->guest_count      ?? '',
            'price_total'      => $package->price_total      ?? '',
            'default_host_phone'      => $package->default_host_phone      ?? '',
        

        // merged "editable per stay" fields (fallback to property defaults)
        'host_phone'       => $withFallback(
            $package->host_phone,
            $prop->default_host_phone
        ),
        'smart_lock_code'  => $withFallback(
            $package->smart_lock_code,
            $prop->default_smart_lock_code
        ),
        'arrival_tips'     => $withFallback(
            $package->arrival_tips,
            $prop->default_arrival_tips
        ),
        'parking_info'     => $withFallback(
            $package->parking_info,
            $prop->default_parking_info
        ),
        'emergency_info'   => $withFallback(
            $package->emergency_info,
            $prop->default_emergency_info
        ),
        'rules_summary'    => $withFallback(
            $package->rules_summary,
            $prop->default_rules_summary
        ),
        'garbage_recycling' => $withFallback(
            $package->garbage_recycling,
            $prop->default_garbage_recycling
        ),
        'appliances_notes' => $withFallback(
            $package->appliances_notes,
            $prop->default_appliances_notes
        ),
        'safety_notes'     => $withFallback(
            $package->safety_notes,
            $prop->default_safety_notes
        ),
        'checkout_list'    => $withFallback(
            $package->checkout_list,
            $prop->default_checkout_list
        ),

        // this "quick" bundle matches what Public/Package.jsx uses.
        // not strictly required for Edit.jsx, but nice to keep parity.
        'quick' => [
            'wifi_name'        => $prop->wifi_name ?? '',
            'wifi_password'    => $prop->wifi_password ?? '',
            'host_phone'       => $withFallback(
                $package->host_phone,
                $prop->default_host_phone
            ),
            'smart_lock_code'  => $withFallback(
                $package->smart_lock_code,
                $prop->default_smart_lock_code
            ),
            'check_in_date'    => $package->check_in_date ?? '',
            'check_out_date'   => $package->check_out_date ?? '',
        ],

        // auto-communication fields
        'auto_send'  => (bool) $package->auto_send,
        'sent_at'    => $package->sent_at?->toDateTimeString(),

        // and we still need sections for editing/reordering
        'sections' => $package->sections
            ->sortBy('sort_order')
            ->map(function ($s) {
                return [
                    'id'         => $s->id,
                    'type'       => $s->type,
                    'title'      => $s->title,
                    'body'       => $s->body,
                    'sort_order' => $s->sort_order,
                ];
            })
            ->values()
            ->toArray(),
    ];

    return Inertia::render('Host/Packages/Edit', [
        'pkg' => $pkgForInertia,
    ]);
}






    private function authorizeProperty(Property $property)
    {
        abort_if(
            auth()->id() !== $property->user_id && !auth()->user()->isHost(),
            403
        );
    }

    // =========================
    // Shared: build default 9 sections for a new package
    // =========================
    private function bootstrapSectionsFor(WelcomePackage $package, Property $property, array $src)
{
    // helper: prefer stay value (src[...] from create form),
    // then property default_*, then fallback text we hardcode.
    $fallbackField = function ($stayKey, $propertyKey, $fallbackText = '') use ($src, $property) {
        $stayVal = $src[$stayKey] ?? null;
        if (isset($stayVal) && trim($stayVal) !== '') {
            return $stayVal;
        }

        $propVal = $property->$propertyKey ?? null;
        if (isset($propVal) && trim($propVal) !== '') {
            return $propVal;
        }

        return $fallbackText;
    };

    // guest line bits (unchanged)
    $guestLine = $package->guest_first_name
        ? ($package->guest_first_name
            . (
                $package->guest_count
                    ? " ({$package->guest_count} " . ($package->guest_count == 1 ? 'guest' : 'guests') . ")"
                    : ""
            )
        )
        : (
            $package->guest_count
                ? $package->guest_count . ' ' . ($package->guest_count == 1 ? 'guest' : 'guests')
                : 'Not set'
        );

    $totalLine = $package->price_total
        ? "\nTotal: $" . number_format((float)$package->price_total, 2)
        : '';

    $sections = [
        // 1. Booking Summary
        [
            'type'       => 'info',
            'title'      => 'Booking Summary',
            'body'       =>
                "Dates: " .
                ($package->check_in_date  ?: '--') .
                " → " .
                ($package->check_out_date ?: '--') .
                "\nGuests: " . $guestLine .
                $totalLine,
            'sort_order' => 1,
        ],

        // 2. Arrival & Check-in
        [
            'type'       => 'info',
            'title'      => 'Arrival & Check-in',
            'body'       => $fallbackField(
                'arrival_tips',                // what they typed for THIS stay
                'default_arrival_tips',        // property default
                "Exact address: {$property->address}\n" .
                "Building/entry tips: (add details)\n" .
                "Check-in: From 3pm unless arranged.\n"
            ),
            'sort_order' => 2,
        ],

        // 3. Transport & Parking
        [
            'type'       => 'info',
            'title'      => 'Transport & Parking',
            'body'       => $fallbackField(
                'parking_info',
                'default_parking_info',
                "Parking: (bay # / permit / height limit)\n" .
                "Public transport: (nearest stop)\n"
            ),
            'sort_order' => 3,
        ],

        // 4. Wi-Fi (this one still uses property wifi directly)
        [
            'type'       => 'info',
            'title'      => 'Wi-Fi',
            'body'       =>
                "Name: " . ($property->wifi_name ?? "—") . "\n" .
                "Password: " . ($property->wifi_password ?? "—"),
            'sort_order' => 4,
        ],

        // 5. House Rules
        [
            'type'       => 'house_rule',
            'title'      => 'House Rules',
            'body'       => $fallbackField(
                'rules_summary',
                'default_rules_summary',
                "No parties or events. Quiet hours 10pm–7am.\n" .
                "No smoking indoors. Visitors by arrangement only.\n" .
                "Max occupancy as per booking."
            ),
            'sort_order' => 5,
        ],

        // 6. Appliances & How-tos
        [
            'type'       => 'guide',
            'title'      => 'Appliances & How-tos',
            'body'       => $fallbackField(
                'appliances_notes',
                'default_appliances_notes',
                "Kitchen: stove/oven/coffee machine tips\n" .
                "Laundry: washer/dryer & detergents\n" .
                "TV/Streaming: inputs, profiles"
            ),
            'sort_order' => 6,
        ],

        // 7. Garbage & Recycling
        [
            'type'       => 'info',
            'title'      => 'Garbage & Recycling',
            'body'       => $fallbackField(
                'garbage_recycling',
                'default_garbage_recycling',
                "Bin locations / collection days / sorting guide.\n" .
                "No food in bedrooms; tidy BBQ after use."
            ),
            'sort_order' => 7,
        ],

        // 8. Safety & Emergencies
        [
            'type'       => 'info',
            'title'      => 'Safety & Emergencies',
            'body'       => $fallbackField(
                'emergency_info',
                'default_emergency_info',
                "Emergencies: 000 (AU)\n" .
                "Your contact: " .
                    (
                        // we merge phone like you do in edit():
                        ($src['host_phone'] ?? $property->default_host_phone ?? '(add in package)')
                    )
                . "\n" .
                "Safety devices: smoke alarms, fire blanket (kitchen)\n" .
                "Hazards: (steps/low beams/hot taps/etc.)"
            ),
            'sort_order' => 8,
        ],

        // 9. Check-out
        [
            'type'       => 'info',
            'title'      => 'Check-out',
            'body'       => $fallbackField(
                'checkout_list',
                'default_checkout_list',
                "Checklist: run dishwasher, empty rubbish/recycling,\n" .
                "used towels in bathroom, A/C off, lock doors/windows,\n" .
                "return keys."
            ),
            'sort_order' => 9,
        ],
    ];

    foreach ($sections as $s) {
        WelcomeSection::create([
            'welcome_package_id' => $package->id,
            'type'               => $s['type'],
            'title'              => $s['title'],
            'body'               => $s['body'],
            'sort_order'         => $s['sort_order'],
        ]);
    }
}


    // =========================
    // Create form (manual entry OR CSV import)
    // =========================
    public function create(Request $request, Property $property)
    {
        $this->authorizeProperty($property);

        return Inertia::render('Host/Packages/Create', [
            'property' => $property->only(
                'id',
                'title',
                'address',

                // pass down all the new default_* fields so the form can prefill
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
            ),

            // CSV import prefill (if they uploaded a file)
            'prefill'              => $request->session()->get('prefill', []),

            // warnings the UI can show
            'importOverlap'        => $request->session()->get('importOverlap', false),
            'importEmailConflict'  => $request->session()->get('importEmailConflict', false),

            // flash feedback
            'flash'                => [
                'success' => session('success'),
                
                'error'   => session('error'),
            ],

            // validation errors from last submit (Create.jsx expects this)
            'errors'               => session('errors')
                ? session('errors')->getBag('default')->getMessages()
                : new \stdClass(),
        ]);
    }

    // =========================
    // Manual create (form submit)
    // =========================
    public function store(Request $r, Property $property)
{
    $this->authorizeProperty($property);

    $validated = $r->validate([
        'check_in_date'        => 'required|date',
        'check_out_date'       => 'required|date|after_or_equal:check_in_date',

        'guest_first_name'     => 'required|string|max:80',
        'guest_email'          => 'required|email:rfc,dns|max:255',
        'guest_phone'          => 'nullable|string|max:40',
        'guest_count'          => 'required|integer|max:50',

        'price_total'          => 'nullable|numeric|min:0|max:999999.99',

        'host_phone'           => 'nullable|string|max:40',
        'smart_lock_code'      => 'nullable|string|max:100',

        // optional content
        'arrival_tips'         => 'nullable|string',
        'parking_info'         => 'nullable|string',
        'emergency_info'       => 'nullable|string',
        'rules_summary'        => 'nullable|string',
        'garbage_recycling'    => 'nullable|string',
        'appliances_notes'     => 'nullable|string',
        'safety_notes'         => 'nullable|string',
        'checkout_list'        => 'nullable|string',
        'auto_send'            => 'nullable|boolean',
    ]);

    // normalize blanks → null
    foreach ([
        'guest_first_name','guest_email','guest_phone','host_phone','smart_lock_code',
        'arrival_tips','parking_info','emergency_info','rules_summary','garbage_recycling',
        'appliances_notes','safety_notes','checkout_list',
    ] as $field) {
        if (array_key_exists($field, $validated)) {
            $validated[$field] = trim((string) $validated[$field]) === '' ? null : trim((string) $validated[$field]);
        }
    }

    $checkIn  = $validated['check_in_date'];
    $checkOut = $validated['check_out_date'];
    $email    = $validated['guest_email'];

    // overlap rule (strict < / > allows same-day turnover)
    $overlapExists = WelcomePackage::where('property_id', $property->id)
        ->where(function ($q) use ($checkIn, $checkOut) {
            $q->where('check_in_date', '<', $checkOut)
              ->where('check_out_date', '>', $checkIn);
        })->exists();

    if ($overlapExists) {
        throw ValidationException::withMessages([
            'check_in_date' => 'These dates overlap an existing stay for this property.',
        ]);
    }

    // same guest email in same date range for same property
    $emailConflict = WelcomePackage::where('property_id', $property->id)
        ->where('guest_email', $email)
        ->where(function ($q) use ($checkIn, $checkOut) {
            $q->where('check_in_date', '<', $checkOut)
              ->where('check_out_date', '>', $checkIn);
        })->exists();

    if ($emailConflict) {
        throw ValidationException::withMessages([
            'guest_email' => 'This guest email is already used for a stay in these dates for this property.',
        ]);
    }

    // slug for public share link
    $slug = Str::slug($property->title) . '-' . Str::lower(Str::random(6));

    // create the stay
    $package = WelcomePackage::create([
        'property_id'        => $property->id,
        'slug'               => $slug,
        'is_published'       => true,

        'check_in_date'      => $validated['check_in_date'],
        'check_out_date'     => $validated['check_out_date'],
        'guest_first_name'   => $validated['guest_first_name'],
        'guest_email'        => $validated['guest_email'],
        'guest_phone'        => $validated['guest_phone']        ?? null,
        'guest_count'        => $validated['guest_count'],
        'price_total'        => $validated['price_total']        ?? null,

        'host_phone'         => $validated['host_phone']         ?? null,
        'smart_lock_code'    => $validated['smart_lock_code']    ?? null,

        'arrival_tips'       => $validated['arrival_tips']       ?? null,
        'parking_info'       => $validated['parking_info']       ?? null,
        'emergency_info'     => $validated['emergency_info']     ?? null,
        'rules_summary'      => $validated['rules_summary']      ?? null,
        'garbage_recycling'  => $validated['garbage_recycling']  ?? null,
        'appliances_notes'   => $validated['appliances_notes']   ?? null,
        'safety_notes'       => $validated['safety_notes']       ?? null,
        'checkout_list'      => $validated['checkout_list']      ?? null,
        'auto_send'          => (bool) ($validated['auto_send']  ?? false),
    ]);



    
    // generate default guest sections
    $this->bootstrapSectionsFor($package, $property, $validated);

    // activity log (optional, non-blocking)
   try {
        Activity::record(
            $r->user(),
            $package,                 // subject
            'created',                 // action (lowercase)
            'Package Created',        // title
            [
            'guest'          => $package->guest_first_name,
        ]
        );
    } catch (\Throwable $e) {
        // swallow logging errors
    }

    
    // generate QR
    $publicUrl = route('public.package', $package->slug);
    $svg       = \QrCode::format('svg')->size(600)->margin(2)->generate($publicUrl);

    $qrPath = "qrcodes/{$package->slug}.svg";
    Storage::disk('public')->put($qrPath, $svg);

    $package->update(['qr_code_path' => $qrPath]);




    if (($r->user()->onboarding_step ?? 0) < 2) {
        $r->user()->update(['onboarding_step' => 2]);
    }

    // Schedule automated messages for this package
    try { (new MessageScheduler)->scheduleForPackage($package); } catch (\Throwable) {}

    return redirect()->route('host.dashboard')->with('success', 'Package created.');
}

    // =========================
    // CSV import create
    // =========================
    public function import(Request $r, Property $property)
    {
        $this->authorizeProperty($property);

        // Must upload CSV
        $r->validate([
            'file' => 'required|file|mimes:csv,txt|max:512',
        ]);

        // Read CSV into array of rows
        $path = $r->file('file')->getRealPath();
        $rows = array_map('str_getcsv', file($path));

        if (count($rows) < 2) {
            throw ValidationException::withMessages([
                'file' => 'The file is empty. Please include at least one guest row.',
            ]);
        }

        // 1. Clean headers (trim + remove BOM)
        $rawHeaders = $rows[0] ?? [];
        $headers = array_map(function ($h) {
            $h = trim($h);
            $h = preg_replace('/^\xEF\xBB\xBF/', '', $h); // strip BOM
            return $h;
        }, $rawHeaders);

        // 2. Map first data row -> assoc
        $dataRow  = $rows[1] ?? [];
        $rowAssoc = [];
        foreach ($headers as $idx => $colName) {
            $rowAssoc[$colName] = $dataRow[$idx] ?? null;
        }

        // 3. Normalize dd/mm/yyyy -> yyyy-mm-dd
        foreach (['check_in_date', 'check_out_date'] as $dateKey) {
            if (!empty($rowAssoc[$dateKey])) {
                if (preg_match('#^(\d{2})/(\d{2})/(\d{4})$#', $rowAssoc[$dateKey], $m)) {
                    $rowAssoc[$dateKey] = "{$m[3]}-{$m[2]}-{$m[1]}";
                }
            }
        }

        // 4. Validate fields (same rules as manual create)
        $validator = Validator::make($rowAssoc, [
            'check_in_date'     => 'required|date',
            'check_out_date'    => 'required|date|after_or_equal:check_in_date',
            'guest_first_name'  => 'required|string|max:80',
            'guest_phone'       => 'nullable|string|max:40',
            'guest_email'       => 'nullable|email|max:255',
            'guest_count'       => 'nullable|integer|max:50',
            'price_total'       => 'nullable|numeric|min:0|max:999999.99',
            'host_phone'        => 'nullable|string|max:40',
            'smart_lock_code'   => 'nullable|string|max:100',
            'arrival_tips'      => 'nullable|string',
            'parking_info'      => 'nullable|string',
            'rules_summary'     => 'nullable|string',
            'emergency_info'    => 'nullable|string',
            'appliances_notes'  => 'nullable|string',
            'garbage_recycling' => 'nullable|string',
            'checkout_list'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file' => $validator->errors()->first(),
            ]);
        }

        $clean = $validator->validated();

        // Prepare non-blocking warnings for UI
        $checkIn  = $clean['check_in_date'];
        $checkOut = $clean['check_out_date'];
        $email    = $clean['guest_email'] ?? null;

        $overlapExists = WelcomePackage::where('property_id', $property->id)
            ->where(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in_date', '<', $checkOut)
                  ->where('check_out_date', '>', $checkIn);
            })
            ->exists();

        $emailConflict = false;
        if (!empty($email)) {
            $emailConflict = WelcomePackage::where('property_id', $property->id)
                ->where('guest_email', $email)
                ->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where('check_in_date', '<', $checkOut)
                      ->where('check_out_date', '>', $checkIn);
                })
                ->exists();
        }

        // Stash into session for Packages/Create UI
        return redirect()
            ->route('packages.create', $property->id)
            ->with('prefill', $clean)
            ->with('importOverlap', $overlapExists)
            ->with('importEmailConflict', $emailConflict)
            ->with('success', 'Imported data loaded. Review and save.');
    }

    // =========================
    // CSV template download
    // =========================
    public function template(Property $property)
    {
        $this->authorizeProperty($property);

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="stay_template.csv"',
        ];

        $columns = [
            'check_in_date',
            'check_out_date',
            'guest_first_name',
            'guest_phone',
            'guest_email',
            'guest_count',
            'price_total',
            'host_phone',
            'smart_lock_code',
            'arrival_tips',
            'parking_info',
            'rules_summary',
            'emergency_info',
            'appliances_notes',
            'garbage_recycling',
            'checkout_list',
        ];

        $callback = function () use ($columns) {
            $out = fopen('php://output', 'w');
            // header row
            fputcsv($out, $columns);
            // example row
            fputcsv($out, [
                '2025-10-27',
                '2025-10-30',
                'Renato',
                '+61 400 000 000',
                'renato@example.com',
                '2',
                '350.00',
                '+61 400 111 222',
                '8420#',
                'Gate is black door on right...',
                'Street parking is free after 6pm…',
                'No parties, quiet hours 10pm–7am…',
                'Emergencies: 000…',
                'Coffee machine: press top-left…',
                'Bins are under sink, pickup Tue…',
                'Run dishwasher, lock windows…',
            ]);
            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    // =========================
    // Update an existing stay
    // =========================
// =========================
// Update an existing stay
// =========================
public function update(Request $r, WelcomePackage $package)
{
    $this->authorize('update', $package);

    abort_if(
        ($package->property->user_id !== $r->user()->id) && !$r->user()->isHost(),
        403
    );

    $validated = $r->validate([
        'check_in_date'    => 'required|date',
        'check_out_date'   => 'required|date|after_or_equal:check_in_date',

        'guest_first_name' => 'required|string|max:80',
        'guest_email'      => 'required|email:rfc,dns|max:255',
        'guest_phone'      => 'nullable|string|max:40',
        'guest_count'      => 'required|integer|max:50',

        'price_total'      => 'nullable|numeric|min:0|max:999999.99',
        'host_phone'       => 'nullable|string|max:40',
        'smart_lock_code'  => 'nullable|string|max:100',

        'arrival_tips'     => 'nullable|string',
        'emergency_info'   => 'nullable|string',
        'auto_send'        => 'nullable|boolean',
    ]);

    // normalize blanks → null
    foreach ([
        'guest_first_name','guest_email','guest_phone',
        'host_phone','smart_lock_code','arrival_tips','emergency_info'
    ] as $f) {
        if (array_key_exists($f, $validated)) {
            $validated[$f] = trim((string) $validated[$f]) === ''
                ? null
                : trim((string) $validated[$f]);
        }
    }

    $checkIn  = $validated['check_in_date'];
    $checkOut = $validated['check_out_date'];
    $email    = $validated['guest_email'];

    // overlap with other stays
    $overlapExists = WelcomePackage::where('property_id', $package->property_id)
        ->where('id', '!=', $package->id)
        ->where(function ($q) use ($checkIn, $checkOut) {
            $q->where('check_in_date', '<', $checkOut)
              ->where('check_out_date', '>', $checkIn);
        })->exists();

    if ($overlapExists) {
        throw ValidationException::withMessages([
            'check_in_date' => 'These dates overlap an existing stay for this property.',
        ]);
    }

    // email reuse conflict in overlapping range
    $emailConflict = WelcomePackage::where('property_id', $package->property_id)
        ->where('id', '!=', $package->id)
        ->where('guest_email', $email)
        ->where(function ($q) use ($checkIn, $checkOut) {
            $q->where('check_in_date', '<', $checkOut)
              ->where('check_out_date', '>', $checkIn);
        })->exists();

    if ($emailConflict) {
        throw ValidationException::withMessages([
            'guest_email' => 'This guest email is already used for a stay in these dates for this property.',
        ]);
    }

    // apply updates
    $validated['auto_send'] = (bool) ($validated['auto_send'] ?? false);
    $package->update($validated);
    $package->refresh(); // make sure we have latest values

    // ─────────────────────────────
    // NEW: refresh "Booking Summary" section text
    // ─────────────────────────────
    $guestLine = $package->guest_first_name
        ? ($package->guest_first_name
            . (
                $package->guest_count
                    ? " ({$package->guest_count} "
                      . ($package->guest_count == 1 ? 'guest' : 'guests')
                      . ")"
                    : ""
            )
        )
        : (
            $package->guest_count
                ? $package->guest_count . ' '
                  . ($package->guest_count == 1 ? 'guest' : 'guests')
                : 'Not set'
        );

    $totalLine = $package->price_total
        ? "\nTotal: $" . number_format((float) $package->price_total, 2)
        : '';

    $bookingSection = $package->sections()
        ->where('title', 'Booking Summary')
        ->first();

    if ($bookingSection) {
        $bookingSection->update([
            'body' =>
                "Dates: " .
                ($package->check_in_date  ?: '--') .
                " → " .
                ($package->check_out_date ?: '--') .
                "\nGuests: " . $guestLine .
                $totalLine,
        ]);
    }

    // log activity (optional)
    Activity::record(
        $r->user(),
        $package,
        'updated',
        'Package Updated',
        ['guest' => $package->guest_first_name]
    );

    // If stay was cancelled, cancel pending messages; otherwise reschedule
    // (reschedule handles date/email changes via updateOrCreate)
    $scheduler = new MessageScheduler;
    try {
        if ($package->status === 'cancelled') {
            $scheduler->cancelForPackage($package);
        } else {
            $scheduler->scheduleForPackage($package);
        }
    } catch (\Throwable) {}

    return back()->with('success', 'Stay details updated.');
}

    // =========================
    // Delete a stay
    // =========================
    public function destroy(Request $request, WelcomePackage $package)
{
        $this->authorize('delete', $package);
    abort_if(
        ($package->property->user_id !== $request->user()->id) && !$request->user()->isHost(),
        403
    );

    // build UI message pieces now (record them before delete)
    $guestName = $package->guest_first_name ?: 'Guest';
    $dates     = trim(($package->check_in_date ?? '') . ' → ' . ($package->check_out_date ?? ''));

    // metadata for activity feed
    $meta = [
        'property_title' => optional($package->property)->title,
        'guest'         => $package->guest_first_name,
        'slug'          => $package->slug,
        'check_in'      => $package->check_in_date,
        'check_out'     => $package->check_out_date,
    ];

    // Cancel any pending scheduled messages before deleting
    try { (new MessageScheduler)->cancelForPackage($package); } catch (\Throwable) {}

    // delete ONCE
    $package->delete();

        // destroy()
            Activity::record($request->user(), null, 'deleted', 'Package Deleted', [
                'guest' => $package->guest_first_name,
            ]);

    return back()->with('success', "Stay for {$guestName} ({$dates}) deleted.");
}
}
