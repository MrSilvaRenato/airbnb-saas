import React, { useEffect } from "react";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";

export default function Create() {
  const {
    property,
    prefill = {},
    importOverlap = false,
    importEmailConflict = false,
    flash = {},
    errors = {},
    auth,
  } = usePage().props;

  const isPro = auth?.user?.plan === 'pro';

  const { data, setData, post, processing } = useForm({
    check_in_date: "",
    check_out_date: "",
    auto_send: false,
    guest_first_name: "",
    guest_email: "",
    guest_phone: "",
    guest_count: "",
    price_total: "",
    host_phone: "",
    smart_lock_code: "",
    arrival_tips: "",
    parking_info: "",
    emergency_info: "",
    rules_summary: "",
    garbage_recycling: "",
    appliances_notes: "",
    safety_notes: "",
    checkout_list: "",
  });

  useEffect(() => {
    if (!prefill || Object.keys(prefill).length === 0) return;

    setData((prev) => ({
      ...prev,
      check_in_date: prefill.check_in_date || prev.check_in_date,
      check_out_date: prefill.check_out_date || prev.check_out_date,
      guest_first_name: prefill.guest_first_name || prev.guest_first_name,
      guest_email: prefill.guest_email || prev.guest_email,
      guest_phone: prefill.guest_phone || prev.guest_phone,
      guest_count: prefill.guest_count || prev.guest_count,
      price_total: prefill.price_total || prev.price_total,
      host_phone: prefill.host_phone || prev.host_phone,
      smart_lock_code: prefill.smart_lock_code || prev.smart_lock_code,
      arrival_tips: prefill.arrival_tips || prev.arrival_tips,
      parking_info: prefill.parking_info || prev.parking_info,
      emergency_info: prefill.emergency_info || prev.emergency_info,
      rules_summary: prefill.rules_summary || prev.rules_summary,
      garbage_recycling: prefill.garbage_recycling || prev.garbage_recycling,
      appliances_notes: prefill.appliances_notes || prev.appliances_notes,
      safety_notes: prefill.safety_notes || prev.safety_notes,
      checkout_list: prefill.checkout_list || prev.checkout_list,
    }));
  }, [prefill, setData]);

  function submit(e) {
    e.preventDefault();
    post(route("packages.store", property.id), {
      preserveScroll: true,
    });
  }

  function handleImportSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);

    router.post(route("packages.import", property.id), fd, {
      forceFormData: true,
    });
  }

  const hasAnyErrors = Object.keys(errors || {}).length > 0;

  return (
    <Shell title={`Create Package • ${property.title}`}>
      <Head title="Create Package" />

      {flash?.success && (
        <div className="fixed left-1/2 -translate-x-1/2 top-4 bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {flash.success}
        </div>
      )}

      {hasAnyErrors && (
        <div className="max-w-3xl mx-auto mb-4 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs p-3">
          Please fix the highlighted fields below.
        </div>
      )}

      {importOverlap && (
        <div className="mb-3 text-xs text-red-600 max-w-3xl mx-auto">
          Warning: These dates overlap an existing stay for this property.
        </div>
      )}
      {importEmailConflict && (
        <div className="mb-3 text-xs text-red-600 max-w-3xl mx-auto">
          Warning: This guest email already has a stay in that date range.
        </div>
      )}

      <div className="rounded-xl border bg-white p-3 mb-6 max-w-3xl mx-auto">
        <div className="text-sm font-semibold mb-2">Import Stay from File</div>
        <p className="text-xs text-gray-600 mb-3">Import with a spreadsheet!</p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={route("packages.template", property.id)}
            className="px-3 py-2 border rounded-lg text-xs"
          >
            Download CSV template
          </a>

          <form
            onSubmit={handleImportSubmit}
            encType="multipart/form-data"
            className="flex items-center gap-2"
          >
            <input
              type="file"
              name="file"
              accept=".csv"
              className="text-xs"
              required
            />

            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-black text-white text-xs"
            >
              Upload &amp; Prefill
            </button>
          </form>
        </div>

        {errors.file && (
          <div className="text-xs text-red-600 mt-2">{errors.file}</div>
        )}
      </div>

      <form onSubmit={submit} className="max-w-3xl mx-auto space-y-4">
        <div className="text-sm text-gray-600">{property.address}</div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Check-in Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-xl p-2"
              value={data.check_in_date}
              onChange={(e) => setData("check_in_date", e.target.value)}
            />
            {errors.check_in_date && (
              <p className="text-xs text-red-600">{errors.check_in_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Check-out Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-xl p-2"
              value={data.check_out_date}
              onChange={(e) => setData("check_out_date", e.target.value)}
            />
            {errors.check_out_date && (
              <p className="text-xs text-red-600">{errors.check_out_date}</p>
            )}
          </div>
        </div>

           <div>
          <label className="block text-sm font-medium">Guest Email</label>
          <input
            type="email"
            required
            className="w-full border rounded-xl p-2"
            value={data.guest_email}
            onChange={(e) => setData("guest_email", e.target.value)}
          />
          {errors.guest_email && (
            <p className="text-xs text-red-600">{errors.guest_email}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Guest Name</label>
            <input
              required
              className="w-full border rounded-xl p-2"
              value={data.guest_first_name}
              onChange={(e) => setData("guest_first_name", e.target.value)}
            />
            {errors.guest_first_name && (
              <p className="text-xs text-red-600">{errors.guest_first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Guest phone / WhatsApp</label>
            <input
              className="w-full border rounded-xl p-2"
              value={data.guest_phone || ""}
              onChange={(e) => setData("guest_phone", e.target.value)}
              placeholder="+61 400 000 000"
            />
            {errors.guest_phone && (
              <div className="text-xs text-red-600 mt-1">{errors.guest_phone}</div>
            )}
          </div>
        </div>

     

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Guests</label>
            <input
              type="number"
              className="w-full border rounded-xl p-2"
              value={data.guest_count}
              onChange={(e) => setData("guest_count", e.target.value)}
            />
            {errors.guest_count && (
              <p className="text-xs text-red-600">{errors.guest_count}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Total price (optional)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-xl p-2"
              value={data.price_total}
              onChange={(e) => setData("price_total", e.target.value)}
            />
            {errors.price_total && (
              <p className="text-xs text-red-600">{errors.price_total}</p>
            )}
          </div>
        </div>

        {/* <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Host phone (for guests)</label>
            <input
              className="w-full border rounded-xl p-2"
              value={data.host_phone}
              onChange={(e) => setData("host_phone", e.target.value)}
            />
            {errors.host_phone && (
              <p className="text-xs text-red-600">{errors.host_phone}</p>
            )}
          </div> */}

          {/* <div>
            <label className="block text-sm font-medium">Smart lock code</label>
            <input
              className="w-full border rounded-xl p-2"
              value={data.smart_lock_code}
              onChange={(e) => setData("smart_lock_code", e.target.value)}
            />
            {errors.smart_lock_code && (
              <p className="text-xs text-red-600">{errors.smart_lock_code}</p>
            )}
          </div> */}
        {/* </div> */}

        {/* <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Arrival &amp; how to find it</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="Building name, gate/entry, what the door looks like..."
              value={data.arrival_tips}
              onChange={(e) => setData("arrival_tips", e.target.value)}
            />
            {errors.arrival_tips && (
              <p className="text-xs text-red-600">{errors.arrival_tips}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Transport &amp; parking</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="Best route, parking bay/permit, height limits..."
              value={data.parking_info}
              onChange={(e) => setData("parking_info", e.target.value)}
            />
            {errors.parking_info && (
              <p className="text-xs text-red-600">{errors.parking_info}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Rules (top level)</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="No parties, quiet hours, pets/smoking/visitors policy..."
              value={data.rules_summary}
              onChange={(e) => setData("rules_summary", e.target.value)}
            />
            {errors.rules_summary && (
              <p className="text-xs text-red-600">{errors.rules_summary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Safety &amp; emergencies</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="000 in Australia for emergencies. Fire extinguisher under sink..."
              value={data.emergency_info}
              onChange={(e) => setData("emergency_info", e.target.value)}
            />
            {errors.emergency_info && (
              <p className="text-xs text-red-600">{errors.emergency_info}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Appliances &amp; how-tos</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="Stove/oven/coffee machine, TV, laundry quick tips..."
              value={data.appliances_notes}
              onChange={(e) => setData("appliances_notes", e.target.value)}
            />
            {errors.appliances_notes && (
              <p className="text-xs text-red-600">{errors.appliances_notes}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Garbage &amp; recycling</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              value={data.garbage_recycling}
              onChange={(e) => setData("garbage_recycling", e.target.value)}
            />
            {errors.garbage_recycling && (
              <p className="text-xs text-red-600">{errors.garbage_recycling}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Check-out checklist</label>
            <textarea
              rows="4"
              className="w-full border rounded-xl p-2"
              placeholder="Run dishwasher, empty bins, towels in bathroom, A/C off, lock up..."
              value={data.checkout_list}
              onChange={(e) => setData("checkout_list", e.target.value)}
            />
            {errors.checkout_list && (
              <p className="text-xs text-red-600">{errors.checkout_list}</p>
            )}
          </div>
        </div> */}

        {isPro && (
          <div className="flex items-center gap-3 py-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.auto_send}
                onChange={(e) => setData('auto_send', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">Auto-send welcome email on check-in day</span>
            </label>
            <span className="text-xs text-gray-400">Pro — guest receives their link automatically at 8am</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            disabled={processing}
            className={`px-4 py-2 rounded-lg text-white text-sm ${processing ? 'bg-gray-400' : 'bg-black'}`}
          >
            {processing ? 'Saving…' : 'Create Package + QR'}
          </button>

          <Link
            href={route("host.dashboard")}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Shell>
  );
}
