  import React from 'react'
  import { Head, useForm, router, Link, usePage} from '@inertiajs/react'
  import Shell from '@/Layouts/Shell'

  export default function Edit() {
    const { property, userMeta, errors = {} } = usePage().props

    const { data, setData, post, processing } = useForm({
      _method: 'put', // spoof PUT for Laravel

      // --- core property info ---
      title: property.title ?? '',
      address: property.address ?? '',
      wifi_name: property.wifi_name ?? '',
      wifi_password: property.wifi_password ?? '',
      notes: property.notes ?? '',

      // --- guest welcome defaults (new, stored on property) ---
      default_host_phone: property.default_host_phone ?? '',
      default_smart_lock_code: property.default_smart_lock_code ?? '',

      default_arrival_tips: property.default_arrival_tips ?? '',
      default_parking_info: property.default_parking_info ?? '',
      default_emergency_info: property.default_emergency_info ?? '',
      default_rules_summary: property.default_rules_summary ?? '',
      default_garbage_recycling: property.default_garbage_recycling ?? '',
      default_appliances_notes: property.default_appliances_notes ?? '',
      default_safety_notes: property.default_safety_notes ?? '',
      default_checkout_list: property.default_checkout_list ?? '',

      // --- branding / pro only ---
      brand_display_name: property.brand_display_name || '',
      brand_contact_label: property.brand_contact_label || '',
      brand_logo_path: property.brand_logo_path || '',
      brand_logo_file: null, // <input type="file">
    })

    const submit = () => {
      post(route('properties.update', property.id), {
        preserveScroll: true,
        forceFormData: true,
      })
    }

    const hasAnyErrors = Object.keys(errors || {}).length > 0
  // 🔥 Stripe upgrade handler
function handleUpgradeClick() {
  // just navigate to the comparison/upgrade page
  router.visit(route('checkout.show')); // <-- whatever route name you used for CheckoutPageController@show
}
    return (
      <Shell title="Edit Property">
        <Head title="Edit Property" />

        {hasAnyErrors && (
          <div className="max-w-2xl mx-auto mb-4 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs p-3">
            Please fix the highlighted fields below.
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6">

          {/* ============= BASIC PROPERTY INFO ============= */}
          <section className="space-y-3">


            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                className="w-full border rounded-xl p-2"
                name="address"
                required
                value={data.address ?? ''}
                onChange={(e) => setData('address', e.target.value)}
                placeholder="123 Beach Rd, Byron Bay NSW"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suburb - City*
              </label>
              <input
                className="w-full border rounded-xl p-2"
                name="title"
                required
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Coastal Loft, CBD 2BR"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

           

            {/* Wi-Fi row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wi-Fi Name
                </label>
                <input
                  className="w-full border rounded-xl p-2"
                  name="wifi_name"
                  placeholder="Network name"
                  value={data.wifi_name ?? ''}
                  onChange={(e) => setData('wifi_name', e.target.value)}
                />
                {errors.wifi_name && (
                  <p className="text-sm text-red-600">{errors.wifi_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wi-Fi Password
                </label>
                <input
                  className="w-full border rounded-xl p-2"
                  name="wifi_password"
                  placeholder="SuperSecret123"
                  value={data.wifi_password ?? ''}
                  onChange={(e) => setData('wifi_password', e.target.value)}
                />
                {errors.wifi_password && (
                  <p className="text-sm text-red-600">{errors.wifi_password}</p>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (only you see this)
              </label>
              <textarea
                rows="3"
                className="w-full border rounded-xl p-2"
                name="notes"
                placeholder="Lockbox behind pillar. Spare keys in laundry cupboard. Body corporate is strict about noise after 10pm."
                value={data.notes ?? ''}
                onChange={(e) => setData('notes', e.target.value)}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes}</p>
              )}
            </div>
          </section>


          {/* ============= GUEST WELCOME DEFAULTS ============= */}
          <section className="rounded-xl border border-gray-300 bg-white p-4 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                Guest Welcome Defaults
              </div>
              <div className="text-xs text-gray-500">
                This info will auto-fill every new stay for this property.
                You can still tweak it per guest when you create a Welcome Package.
              </div>
            </div>

            {/* host phone + smart lock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host phone (what guest sees)
                </label>
                <input
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_host_phone"
                  value={data.default_host_phone}
                  onChange={(e) =>
                    setData('default_host_phone', e.target.value)
                  }
                  placeholder="+61 400 000 000"
                />
                {errors.default_host_phone && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_host_phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Smart lock / access code
                </label>
                <input
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_smart_lock_code"
                  value={data.default_smart_lock_code}
                  onChange={(e) =>
                    setData('default_smart_lock_code', e.target.value)
                  }
                  placeholder="A12B#4099"
                />
                {errors.default_smart_lock_code && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_smart_lock_code}
                  </p>
                )}
              </div>
            </div>

            {/* big textareas 2-col grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival & how to find it
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_arrival_tips"
                  placeholder="Gate code, building entrance, lift access, where to park to unload..."
                  value={data.default_arrival_tips}
                  onChange={(e) =>
                    setData('default_arrival_tips', e.target.value)
                  }
                />
                {errors.default_arrival_tips && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_arrival_tips}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport & parking
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_parking_info"
                  placeholder="Visitor bay is #12. Max height 2.1m. Best Uber drop-off is the laneway on Smith St."
                  value={data.default_parking_info}
                  onChange={(e) =>
                    setData('default_parking_info', e.target.value)
                  }
                />
                {errors.default_parking_info && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_parking_info}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House rules (top level)
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_rules_summary"
                  placeholder="No parties. Quiet hours after 10pm. No unregistered guests overnight."
                  value={data.default_rules_summary}
                  onChange={(e) =>
                    setData('default_rules_summary', e.target.value)
                  }
                />
                {errors.default_rules_summary && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_rules_summary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergencies / safety
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_emergency_info"
                  placeholder="000 in Australia for emergencies. Fire extinguisher under kitchen sink. First aid kit in top drawer."
                  value={data.default_emergency_info}
                  onChange={(e) =>
                    setData('default_emergency_info', e.target.value)
                  }
                />
                {errors.default_emergency_info && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_emergency_info}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appliances & how-tos
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_appliances_notes"
                  placeholder="Dishwasher: hold power 2s then press Start. Coffee machine: press left button twice for long black."
                  value={data.default_appliances_notes}
                  onChange={(e) =>
                    setData('default_appliances_notes', e.target.value)
                  }
                />
                {errors.default_appliances_notes && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_appliances_notes}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garbage & recycling
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_garbage_recycling"
                  placeholder="Red bin = landfill, yellow = recycling, green = organics. Bins live in carpark level B1."
                  value={data.default_garbage_recycling}
                  onChange={(e) =>
                    setData('default_garbage_recycling', e.target.value)
                  }
                />
                {errors.default_garbage_recycling && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_garbage_recycling}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety notes
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_safety_notes"
                  placeholder="Balcony rail is waist height, supervise kids. Please keep BBQ gas OFF when not in use."
                  value={data.default_safety_notes}
                  onChange={(e) =>
                    setData('default_safety_notes', e.target.value)
                  }
                />
                {errors.default_safety_notes && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_safety_notes}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out checklist
                </label>
                <textarea
                  rows="4"
                  className="w-full border rounded-xl p-2 text-sm"
                  name="default_checkout_list"
                  placeholder="Run dishwasher, empty bins, towels in bathroom, A/C off, lock up."
                  value={data.default_checkout_list}
                  onChange={(e) =>
                    setData('default_checkout_list', e.target.value)
                  }
                />
                {errors.default_checkout_list && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.default_checkout_list}
                  </p>
                )}
              </div>
            </div>
          </section>


          {/* ============= BRANDING (PRO ONLY) ============= */}
          {userMeta?.plan === 'pro' ? (
            <section className="rounded-xl border border-gray-300 bg-white p-4 space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  Guest-Facing Branding
                </div>
                <div className="text-xs text-gray-500">
                  This shows on the guest welcome page (/p/... link). Your logo / name
                  replaces the generic “Hi Sarah, your stay starts in 2 days ✈️”.
                </div>
              </div>

              {/* Display Name */}
              <label className="block text-sm">
                <div className="text-gray-700 font-medium mb-1">
                  Display Name / Headline
                </div>
                <input
                  className="w-full rounded border p-2 text-sm"
                  name="brand_display_name"
                  value={data.brand_display_name}
                  onChange={(e) =>
                    setData('brand_display_name', e.target.value)
                  }
                  placeholder="Coastal Escapes — Matt & Rafa"
                />
                {errors.brand_display_name && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.brand_display_name}
                  </p>
                )}
              </label>

              {/* Contact Label */}
              <label className="block text-sm">
                <div className="text-gray-700 font-medium mb-1">
                  Contact Label
                </div>
                <input
                  className="w-full rounded border p-2 text-sm"
                  name="brand_contact_label"
                  value={data.brand_contact_label}
                  onChange={(e) =>
                    setData('brand_contact_label', e.target.value)
                  }
                  placeholder="Text us anytime"
                />
                {errors.brand_contact_label && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.brand_contact_label}
                  </p>
                )}
              </label>

              {/* Logo Upload */}
              <label className="block text-sm">
                <div className="text-gray-700 font-medium mb-1">
                  Property Logo / Badge
                </div>

                {data.brand_logo_path ? (
                  <div className="mb-2 flex items-center gap-3">
                    <div className="w-16 h-16 rounded border bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={data.brand_logo_path}
                        alt="Current Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 leading-tight">
                      Currently shown on the guest welcome page.
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 text-[11px] text-gray-500">
                    No logo uploaded yet.
                  </div>
                )}

                <input
                  type="file"
                  name="brand_logo_file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    setData('brand_logo_file', e.target.files[0] || null)
                  }
                  className="block w-full text-sm text-gray-700 border rounded px-2 py-1 cursor-pointer bg-white"
                />

                {errors.brand_logo_file && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.brand_logo_file}
                  </p>
                )}

                <div className="text-[11px] text-gray-500 mt-1">
                  PNG / JPG / WEBP • max 4MB • square works best.
                </div>
              </label>
            </section>
          ) : (
            <section className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-xs text-gray-800">
              <div className="font-semibold text-gray-900 text-sm mb-1">
                Branding (Pro)
              </div>
              <div className="text-yellow-700 mb-3"> 
              Add your logo and concierge-style header to the guest welcome link.
              Upgrade to Pro to enable.
            </div>
               <button
            onClick={handleUpgradeClick}
            className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-white font-medium hover:bg-yellow-700"
          >
            Upgrade to Pro
          </button>
            </section>
          )}

          {/* helper note */}
          <p className="text-xs text-gray-500">
            Note: <b>Check-in / Check-out dates</b> are set when creating a{' '}
            <b>Welcome Package</b> for a guest.
          </p>

          {/* actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-sm">
            <button
              type="button"
              disabled={processing}
              onClick={submit}
              className={`px-4 py-2 rounded-lg text-white ${
                processing ? 'bg-gray-400' : 'bg-black'
              }`}
            >
              {processing ? 'Saving…' : 'Save Property'}
            </button>

            <Link
              href={route('host.dashboard')}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </Link>
          </div>
        </div>
      </Shell>
    )
  }
