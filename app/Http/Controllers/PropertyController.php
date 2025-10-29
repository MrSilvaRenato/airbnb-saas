<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Host/Properties/Create', [
            'userMeta' => [
                'plan' => $request->user()->plan ?? 'free', // 'free' | 'pro'
            ],
        ]);
    }

    public function store(Request $request)
    {
        // validate all property-level info (including new defaults)
        $validated = $request->validate([
            'title'                     => 'required|string|max:255',
            'address'                   => 'nullable|string|max:255',
            'wifi_name'                 => 'nullable|string|max:255',
            'wifi_password'             => 'nullable|string|max:255',
            'notes'                     => 'nullable|string',

            // pro branding
            'brand_display_name'        => 'nullable|string|max:255',
            'brand_contact_label'       => 'nullable|string|max:255',
            'brand_logo_file'           => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',

            // NEW property-level defaults for future stays
            'default_host_phone'        => 'nullable|string|max:40',
            'default_smart_lock_code'   => 'nullable|string|max:100',

            'default_arrival_tips'      => 'nullable|string',
            'default_parking_info'      => 'nullable|string',
            'default_emergency_info'    => 'nullable|string',
            'default_rules_summary'     => 'nullable|string',
            'default_garbage_recycling' => 'nullable|string',
            'default_appliances_notes'  => 'nullable|string',
            'default_safety_notes'      => 'nullable|string',
            'default_checkout_list'     => 'nullable|string',
        ]);

        $isPro = ($request->user()->plan ?? 'free') === 'pro';

        // build data for insertion
        $dataToCreate = [
            'user_id'                  => $request->user()->id,
            'title'                    => $validated['title'],
            'address'                  => $validated['address']                   ?? null,
            'wifi_name'                => $validated['wifi_name']                 ?? null,
            'wifi_password'            => $validated['wifi_password']             ?? null,
            'notes'                    => $validated['notes']                     ?? null,

            // save the default_* guest-facing info
            'default_host_phone'        => $validated['default_host_phone']        ?? null,
            'default_smart_lock_code'   => $validated['default_smart_lock_code']   ?? null,
            'default_arrival_tips'      => $validated['default_arrival_tips']      ?? null,
            'default_parking_info'      => $validated['default_parking_info']      ?? null,
            'default_emergency_info'    => $validated['default_emergency_info']    ?? null,
            'default_rules_summary'     => $validated['default_rules_summary']     ?? null,
            'default_garbage_recycling' => $validated['default_garbage_recycling'] ?? null,
            'default_appliances_notes'  => $validated['default_appliances_notes']  ?? null,
            'default_safety_notes'      => $validated['default_safety_notes']      ?? null,
            'default_checkout_list'     => $validated['default_checkout_list']     ?? null,
        ];

        if ($isPro) {
            // allow branding
            $dataToCreate['brand_display_name']  = $validated['brand_display_name']  ?? null;
            $dataToCreate['brand_contact_label'] = $validated['brand_contact_label'] ?? null;

            if ($request->hasFile('brand_logo_file')) {
                $path = $request->file('brand_logo_file')->store('brand', 'public');
                $dataToCreate['brand_logo_path'] = '/storage/' . $path;
            } else {
                $dataToCreate['brand_logo_path'] = null;
            }
        } else {
            // free plan: scrub branding
            $dataToCreate['brand_display_name']  = null;
            $dataToCreate['brand_contact_label'] = null;
            $dataToCreate['brand_logo_path']     = null;
        }

        Property::create($dataToCreate);

        return redirect()
            ->route('host.dashboard')
            ->with('success', 'Property created.');
    }

    public function edit(Request $request, Property $property)
    {
        abort_if(
            $request->user()->id !== $property->user_id && !$request->user()->isHost(),
            403
        );

        return Inertia::render('Host/Properties/Edit', [
            'property' => $property->only(
                'id',
                'title',
                'address',
                'wifi_name',
                'wifi_password',
                'notes',

                // pro branding fields
                'brand_display_name',
                'brand_contact_label',
                'brand_logo_path',

                // NEW default_* fields so Edit.jsx can show/allow editing them
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
            'userMeta' => [
                'plan' => $request->user()->plan ?? 'free',
            ],
        ]);
    }

    public function update(Request $request, Property $property)
    {
        abort_if(
            $request->user()->id !== $property->user_id && !$request->user()->isHost(),
            403
        );

        // we can safely use validate() again now that field names match DB columns
        $validated = $request->validate([
            'title'                     => 'required|string|max:255',
            'address'                   => 'nullable|string|max:255',
            'wifi_name'                 => 'nullable|string|max:255',
            'wifi_password'             => 'nullable|string|max:255',
            'notes'                     => 'nullable|string',

            // branding (pro)
            'brand_display_name'        => 'nullable|string|max:255',
            'brand_contact_label'       => 'nullable|string|max:255',
            'brand_logo_file'           => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',

            // defaults for future packages
            'default_host_phone'        => 'nullable|string|max:40',
            'default_smart_lock_code'   => 'nullable|string|max:100',

            'default_arrival_tips'      => 'nullable|string',
            'default_parking_info'      => 'nullable|string',
            'default_emergency_info'    => 'nullable|string',
            'default_rules_summary'     => 'nullable|string',
            'default_garbage_recycling' => 'nullable|string',
            'default_appliances_notes'  => 'nullable|string',
            'default_safety_notes'      => 'nullable|string',
            'default_checkout_list'     => 'nullable|string',
        ]);

        $isPro = ($request->user()->plan ?? 'free') === 'pro';

        // core info
        $property->title                    = $validated['title'];
        $property->address                  = $validated['address']                   ?? null;
        $property->wifi_name                = $validated['wifi_name']                 ?? null;
        $property->wifi_password            = $validated['wifi_password']             ?? null;
        $property->notes                    = $validated['notes']                     ?? null;

        // new default_* info
        $property->default_host_phone        = $validated['default_host_phone']        ?? null;
        $property->default_smart_lock_code   = $validated['default_smart_lock_code']   ?? null;
        $property->default_arrival_tips      = $validated['default_arrival_tips']      ?? null;
        $property->default_parking_info      = $validated['default_parking_info']      ?? null;
        $property->default_emergency_info    = $validated['default_emergency_info']    ?? null;
        $property->default_rules_summary     = $validated['default_rules_summary']     ?? null;
        $property->default_garbage_recycling = $validated['default_garbage_recycling'] ?? null;
        $property->default_appliances_notes  = $validated['default_appliances_notes']  ?? null;
        $property->default_safety_notes      = $validated['default_safety_notes']      ?? null;
        $property->default_checkout_list     = $validated['default_checkout_list']     ?? null;

        // branding: only allow if Pro
        if ($isPro) {
            $property->brand_display_name  = $validated['brand_display_name']  ?? null;
            $property->brand_contact_label = $validated['brand_contact_label'] ?? null;

            if ($request->hasFile('brand_logo_file')) {
                $path = $request->file('brand_logo_file')->store('brand', 'public');
                $property->brand_logo_path = '/storage/' . $path;
            }
        } else {
            $property->brand_display_name  = null;
            $property->brand_contact_label = null;
            $property->brand_logo_path     = null;
        }

        $property->save();

        return redirect()
            ->route('host.dashboard')
            ->with('success', 'Property updated.');
    }

    public function destroy(Request $request, Property $property)
    {
        abort_if(
            $request->user()->id !== $property->user_id && !$request->user()->isHost(),
            403
        );

        $title = $property->title;
        $property->delete();

        return back()->with('success', "Property “{$title}” deleted.");
    }
}
