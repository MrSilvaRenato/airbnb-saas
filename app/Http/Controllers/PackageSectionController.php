<?php

namespace App\Http\Controllers;

use App\Models\WelcomePackage;
use App\Models\WelcomeSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageSectionController extends Controller
{
    public function edit(Request $request, WelcomePackage $package)
    {
        // Authorize against the package (owner of the property can edit sections)
        $this->authorize('update', $package);

        // eager load relationships so we have property + all sections
        $package->load([
            'property' => function ($q) {
                $q->select(
                    'id',
                    'user_id',
                    'title',
                    'address',
                    'wifi_name',
                    'wifi_password',

                    // all the new default_* guest-facing fields
                    'default_host_phone',
                    'default_smart_lock_code',
                    'default_arrival_tips',
                    'default_parking_info',
                    'default_emergency_info',
                    'default_rules_summary',
                    'default_garbage_recycling',
                    'default_appliances_notes',
                    'default_safety_notes',
                    'default_checkout_list'
                );
            },
            'sections' => fn($q) => $q->orderBy('sort_order'),
        ]);

        // Extra ownership check (defensive)
        abort_if(
            $package->property->user_id !== $request->user()->id
            && !$request->user()->isHost(),
            403
        );

        $prop = $package->property;

        // helper: prefer stay override if it's non-empty,
        // otherwise fall back to property's default_*
        $withFallback = function ($stayValue, $propertyValue) {
            if (isset($stayValue) && trim((string)$stayValue) !== '') {
                return $stayValue;
            }
            return $propertyValue ?? '';
        };

        // Build pkg payload exactly in the shape Packages/Edit.jsx expects
        $pkg = [
            'id'       => $package->id,
            'slug'     => $package->slug,

            // These two are shown in the header of the Edit page
            'title'    => $prop->title ?? '',
            'address'  => $prop->address ?? '',

            // STAY / GUEST CORE FIELDS ======================
            'check_in_date'    => $package->check_in_date ?? '',
            'check_out_date'   => $package->check_out_date ?? '',
            'guest_first_name' => $package->guest_first_name ?? '',
            'guest_email'      => $package->guest_email ?? '',
            'guest_phone'      => $package->guest_phone ?? '',
            'guest_count'      => $package->guest_count ?? '',
            'price_total'      => $package->price_total ?? '',
            'house_rules'      => $package->house_rules ?? '',

            // MERGED FIELDS (stay override OR property default_*) ========
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

            // Wi-Fi from property
            'wifi_name'        => $prop->wifi_name ?? '',
            'wifi_password'    => $prop->wifi_password ?? '',

            // sections for the editor
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

        return Inertia::render('Host/Packages/Edit', [
            'pkg' => $pkg,
        ]);
    }

    public function store(Request $r, WelcomePackage $package)
    {
        $this->authorize('update', $package);
        $this->authorizeHost($package);

        $data = $r->validate([
            'type'  => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'body'  => 'nullable|string',
        ]);

        $maxOrder = $package->sections()->max('sort_order') ?? 0;
        $data['sort_order'] = $maxOrder + 1;
        $data['welcome_package_id'] = $package->id;

        WelcomeSection::create($data);

        return back()->with('success', 'Section added.');
    }

    public function update(Request $r, WelcomeSection $section)
    {
        $this->authorize('update', $section);
        $this->authorizeHost($section->package);

        $data = $r->validate([
            'type'  => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'body'  => 'nullable|string',
        ]);

        $section->update($data);

        return back()->with('success', 'Section updated.');
    }

    public function destroy(WelcomeSection $section)
    {
        $this->authorize('delete', $section);
        $this->authorizeHost($section->package);

        $section->delete();

        return back()->with('success', 'Section removed.');
    }

    public function reorder(Request $r, WelcomePackage $package)
    {
        // authorize on the package, not a non-existent $section
        $this->authorize('update', $package);
        $this->authorizeHost($package);

        $data = $r->validate([
            'order' => 'required|array', // array of {id, sort_order}
            'order.*.id' => 'required|integer|exists:welcome_sections,id',
            'order.*.sort_order' => 'required|integer|min:1',
        ]);

        foreach ($data['order'] as $row) {
            WelcomeSection::where('id', $row['id'])
                ->where('welcome_package_id', $package->id)
                ->update(['sort_order' => $row['sort_order']]);
        }

        return back()->with('success', 'Order saved.');
    }

    private function authorizeHost(WelcomePackage $package)
    {
        abort_if(
            auth()->id() !== $package->property->user_id
            && !auth()->user()->isHost(),
            403
        );
    }
}
