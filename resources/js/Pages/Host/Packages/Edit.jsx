import React, { useState, useEffect } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'

export default function Edit() {
  const { pkg } = usePage().props

  const [metaSaved, setMetaSaved] = useState(false)
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderSaved, setOrderSaved] = useState(false)

  // 1. STAY & GUEST DETAILS FORM (meta)
  //    These keys MUST match the welcome_packages columns
  //    and the validation rules in WelcomePackageController@update()
  const {
    data: meta,
    setData: setMeta,
    put,
    processing: savingMeta,
    errors: metaErrors,
  } = useForm({
    check_in_date:    pkg.check_in_date    || '',
    check_out_date:   pkg.check_out_date   || '',
    guest_first_name: pkg.guest_first_name || '',
    guest_email:      pkg.guest_email      || '',
    guest_count:      pkg.guest_count      || '',
    guest_phone:      pkg.guest_phone      || '',
    host_phone:       pkg.host_phone       || '',
    smart_lock_code:  pkg.smart_lock_code  || '',
    arrival_tips:     pkg.arrival_tips     || '',
    emergency_info:   pkg.emergency_info   || '',
    price_total:      pkg.price_total      || '',
  })

  const saveMeta = (e) => {
    e.preventDefault()
    setMetaSaved(false)

    put(route('packages.update', pkg.id), {
      preserveScroll: true,
      onSuccess: () => {
        setMetaSaved(true)
      },
    })
  }

  // 2. ADD NEW SECTION FORM
  const {
    data: newSection,
    setData: setNewSection,
    post,
    processing: addingSection,
    reset,
    errors: sectionErrors,
  } = useForm({
    type: 'info',
    title: '',
    body: '',
  })

  const addSection = (e) => {
    e.preventDefault()
    post(route('sections.store', pkg.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        // reload pkg prop so new section appears in list
        router.reload({ only: ['pkg'] })
      },
    })
  }

  // 3. EXISTING SECTIONS LOCAL STATE + SAVE / REORDER / DELETE
  const [items, setItems] = useState(
    [...pkg.sections].sort((a, b) => a.sort_order - b.sort_order)
  )

  // track which section is saving, and which ones recently saved
  const [savingSectionId, setSavingSectionId] = useState(null)
  const [savedSections, setSavedSections] = useState({})

  // sync local list whenever pkg.sections changes
  useEffect(() => {
    setItems([...pkg.sections].sort((a, b) => a.sort_order - b.sort_order))
  }, [pkg.sections])

  function editLocalSection(id, field, value) {
    setItems(prev =>
      prev.map(sec => (sec.id === id ? { ...sec, [field]: value } : sec))
    )
    // clear "Saved ✓" for that section once user starts typing again
    setSavedSections(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  function saveSection(id) {
    const sec = items.find(s => s.id === id)
    if (!sec) return

    setSavingSectionId(id)

    router.put(
      route('sections.update', id),
      {
        type: sec.type,
        title: sec.title,
        body: sec.body,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSavingSectionId(null)
          setSavedSections(prev => ({ ...prev, [id]: true }))
        },
        onError: () => {
          setSavingSectionId(null)
        },
      }
    )
  }

  function removeSection(id) {
    if (!confirm('Remove this section?')) return
    router.delete(route('sections.destroy', id), {
      preserveScroll: true,
    })
  }

  // drag / reorder support
  const [dragId, setDragId] = useState(null)

  function onDragStart(id) {
    setDragId(id)
  }

  function onDragOver(e, overId) {
    e.preventDefault()
    if (dragId === overId) return

    const next = [...items]
    const from = next.findIndex((x) => x.id === dragId)
    const to   = next.findIndex((x) => x.id === overId)

    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)

    setItems(next)
  }

  function saveOrder() {
    const order = items.map((x, idx) => ({
      id: x.id,
      sort_order: idx + 1,
    }))

    setOrderSaving(true)
    setOrderSaved(false)

    router.post(
      route('sections.reorder', pkg.id),
      { order },
      {
        preserveScroll: true,
        onSuccess: () => {
          setOrderSaving(false)
          setOrderSaved(true)
        },
        onError: () => {
          setOrderSaving(false)
        },
      }
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Head title={`Edit • ${pkg.title}`} />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{pkg.title}</h1>
        {pkg.address && (
          <div className="text-sm text-gray-600">{pkg.address}</div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Editing stay & guest info + sections
        </div>
      </div>

      {/* 1. STAY / GUEST / ACCESS DETAILS */}
      <form
        onSubmit={saveMeta}
        className="rounded-2xl border bg-white p-4 mb-8 space-y-4"
      >
        <div className="text-sm font-semibold text-gray-800">
          Stay & Guest Details
        </div>

        {/* guest email + phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Guest email</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="name@example.com"
              value={meta.guest_email}
              onChange={(e) => setMeta('guest_email', e.target.value)}
            />
            {metaErrors.guest_email && (
              <div className="text-xs text-red-600">{metaErrors.guest_email}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Guest phone / WhatsApp</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="+61 400 000 000"
              value={meta.guest_phone || ''}
              onChange={(e) => setMeta('guest_phone', e.target.value)}
            />
            {metaErrors.guest_phone && (
              <div className="text-xs text-red-600 mt-1">{metaErrors.guest_phone}</div>
            )}
          </div>
        </div>

        {/* guest name + count */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Guest first name</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="Rafaela"
              value={meta.guest_first_name}
              onChange={(e) => setMeta('guest_first_name', e.target.value)}
            />
            {metaErrors.guest_first_name && (
              <div className="text-xs text-red-600">{metaErrors.guest_first_name}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Guest count</label>
            <input
              type="number"
              min="1"
              className="border rounded-lg p-2 text-sm"
              placeholder="2"
              value={meta.guest_count}
              onChange={(e) => setMeta('guest_count', e.target.value)}
            />
            {metaErrors.guest_count && (
              <div className="text-xs text-red-600">{metaErrors.guest_count}</div>
            )}
          </div>
        </div>

        {/* dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Check-in date</label>
            <input
              type="date"
              className="border rounded-lg p-2 text-sm"
              value={meta.check_in_date}
              onChange={(e) => setMeta('check_in_date', e.target.value)}
            />
            {metaErrors.check_in_date && (
              <div className="text-xs text-red-600">{metaErrors.check_in_date}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Check-out date</label>
            <input
              type="date"
              className="border rounded-lg p-2 text-sm"
              value={meta.check_out_date}
              onChange={(e) => setMeta('check_out_date', e.target.value)}
            />
            {metaErrors.check_out_date && (
              <div className="text-xs text-red-600">{metaErrors.check_out_date}</div>
            )}
          </div>
        </div>

        {/* hProperty Fields inserted from Properties/Create.jsx */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Host phone (shown to guest)</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="+61 400 000 000"
              value={meta.host_phone}
              onChange={(e) => setMeta('host_phone', e.target.value)}
            />
            {metaErrors.host_phone && (
              <div className="text-xs text-red-600">{metaErrors.host_phone}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Smart lock code</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="e.g. 4829#"
              value={meta.smart_lock_code}
              onChange={(e) => setMeta('smart_lock_code', e.target.value)}
            />
            {metaErrors.smart_lock_code && (
              <div className="text-xs text-red-600">{metaErrors.smart_lock_code}</div>
            )}
          </div>
        </div>

        {/* arrival instructions / emergency info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Arrival / how to find it</label>
            <textarea
              className="border rounded-lg p-2 text-sm"
              rows="3"
              placeholder="Park on Smith St, use side gate, keypad on left..."
              value={meta.arrival_tips}
              onChange={(e) => setMeta('arrival_tips', e.target.value)}
            />
            {metaErrors.arrival_tips && (
              <div className="text-xs text-red-600">{metaErrors.arrival_tips}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Safety / emergencies</label>
            <textarea
              className="border rounded-lg p-2 text-sm"
              rows="3"
              placeholder="000 in Australia for emergencies. Fire extinguisher under sink..."
              value={meta.emergency_info}
              onChange={(e) => setMeta('emergency_info', e.target.value)}
            />
            {metaErrors.emergency_info && (
              <div className="text-xs text-red-600">{metaErrors.emergency_info}</div>
            )}
          </div>
        </div>

        {/* price */}
        <div className="flex flex-col max-w-xs">
          <label className="text-xs text-gray-500 mb-1">
            Price total (optional, guest doesn’t need to see this if you don’t want)
          </label>
          <input
            type="number"
            step="0.01"
            className="border rounded-lg p-2 text-sm"
            placeholder="1450.00"
            value={meta.price_total}
            onChange={(e) => setMeta('price_total', e.target.value)}
          />
          {metaErrors.price_total && (
            <div className="text-xs text-red-600">{metaErrors.price_total}</div>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            disabled={savingMeta}
            className={`px-4 py-2 rounded-lg text-white text-sm ${
              savingMeta ? 'bg-gray-400' : 'bg-black'
            }`}
          >
            {savingMeta ? 'Saving…' : 'Save Stay Details'}
          </button>

          {metaSaved && (
            <span className="text-emerald-600 text-sm font-medium">Saved ✓</span>
          )}
        </div>
      </form>

      {/* 2. ADD NEW SECTION */}
      <form
        onSubmit={addSection}
        className="rounded-2xl border bg-white p-4 space-y-3 mb-8"
      >
        <div className="text-sm font-semibold text-gray-800">Add a Section</div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col col-span-1">
            <label className="text-xs text-gray-500 mb-1">Type</label>
            <select
              className="border rounded-lg p-2 text-sm"
              value={newSection.type}
              onChange={(e) => setNewSection('type', e.target.value)}
            >
              <option value="info">Info</option>
              <option value="house_rule">House Rule</option>
              <option value="guide">Guide</option>
              <option value="faq">FAQ</option>
              <option value="contact">Contact</option>
            </select>
            {sectionErrors.type && (
              <div className="text-xs text-red-600">{sectionErrors.type}</div>
            )}
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-500 mb-1">Title</label>
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="e.g. House Rules"
              value={newSection.title}
              onChange={(e) => setNewSection('title', e.target.value)}
            />
            {sectionErrors.title && (
              <div className="text-xs text-red-600">{sectionErrors.title}</div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Body</label>
          <textarea
            className="border rounded-lg p-2 text-sm"
            rows="3"
            placeholder="No parties. Quiet hours 10pm–7am. Please respect neighbours…"
            value={newSection.body}
            onChange={(e) => setNewSection('body', e.target.value)}
          />
        </div>

        <button
          disabled={addingSection}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          Add Section
        </button>
      </form>

      {/* 3. EXISTING SECTIONS LIST */}
      <div className="space-y-3 mb-8">
        {items.map((s, idx) => (
          <div
            key={s.id}
            draggable
            onDragStart={() => onDragStart(s.id)}
            onDragOver={(e) => onDragOver(e, s.id)}
            className="rounded-2xl border bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="cursor-grab select-none text-gray-500 mt-1">≡</div>

              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col col-span-1">
                    <label className="text-xs text-gray-500 mb-1">Type</label>
                    <select
                      className="border rounded-lg p-2 text-sm"
                      value={s.type}
                      onChange={(e) => editLocalSection(s.id, 'type', e.target.value)}
                    >
                      <option value="info">Info</option>
                      <option value="house_rule">House Rule</option>
                      <option value="guide">Guide</option>
                      <option value="faq">FAQ</option>
                      <option value="contact">Contact</option>
                    </select>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-xs text-gray-500 mb-1">Title</label>
                    <input
                      className="border rounded-lg p-2 text-sm"
                      value={s.title}
                      onChange={(e) => editLocalSection(s.id, 'title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Body</label>
                  <textarea
                    className="border rounded-lg p-2 text-sm"
                    rows="3"
                    value={s.body ?? ''}
                    onChange={(e) => editLocalSection(s.id, 'body', e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <div>Order: {idx + 1}</div>

                  <button
                    type="button"
                    disabled={savingSectionId === s.id}
                    onClick={() => saveSection(s.id)}
                    className={`px-3 py-1 rounded-lg text-white ${
                      savingSectionId === s.id ? 'bg-gray-400' : 'bg-black'
                    }`}
                  >
                    {savingSectionId === s.id ? 'Saving…' : 'Save Section'}
                  </button>

                  {savedSections[s.id] && (
                    <span className="text-emerald-600 font-medium">Saved ✓</span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeSection(s.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mb-12 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveOrder}
          disabled={orderSaving}
          className={`px-4 py-2 rounded-lg text-white text-sm ${
            orderSaving ? 'bg-gray-400' : 'bg-emerald-600'
          }`}
        >
          {orderSaving ? 'Saving…' : 'Save Sorting Order'}
        </button>

        {orderSaved && (
          <span className="text-emerald-600 text-sm font-medium">Saved ✓</span>
        )}

        <a
          href={route('host.dashboard')}
          className="px-4 py-2 rounded-lg border text-sm"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}
