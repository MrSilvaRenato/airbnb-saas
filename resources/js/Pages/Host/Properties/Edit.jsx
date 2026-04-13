import React, { useState } from 'react'
import { Head, useForm, usePage, Link, router } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'
import PropertyForm from '@/Components/PropertyForm'

function IcalSection({ property, feed }) {
    const [url, setUrl] = useState(feed?.url ?? '')
    const [syncing, setSyncing] = useState(false)

    function save(e) {
        e.preventDefault()
        router.post(route('ical.store', property.id), { url }, { preserveScroll: true })
    }

    function syncNow() {
        setSyncing(true)
        router.post(route('ical.sync', property.id), {}, {
            preserveScroll: true,
            onFinish: () => setSyncing(false),
        })
    }

    function remove() {
        if (!confirm('Remove iCal feed? Auto-sync will stop.')) return
        router.delete(route('ical.destroy', property.id), { preserveScroll: true })
    }

    const statusOk  = feed?.last_sync_status === 'ok'
    const statusErr = feed?.last_sync_status && !statusOk
    const lastSync  = feed?.last_synced_at ? new Date(feed.last_synced_at).toLocaleString() : null

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-gray-900">📅 Calendar Sync</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">AUTO</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                Paste your Airbnb or VRBO iCal link — stays will be created automatically every 15 minutes.
            </p>

            <form onSubmit={save} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">iCal URL</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://www.airbnb.com/calendar/ical/..."
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                            required
                        />
                        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition">
                            Save
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        Airbnb: <span className="font-medium">Hosting → Calendar → Export Calendar</span> &nbsp;·&nbsp;
                        VRBO: <span className="font-medium">Calendar → Export iCal</span>
                    </p>
                </div>
            </form>

            {feed && (
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        {statusOk && <span className="flex items-center gap-1 text-xs text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Synced {lastSync}</span>}
                        {statusErr && <span className="flex items-center gap-1 text-xs text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Error — {feed.last_sync_status?.replace('Error: ', '')}</span>}
                        {!feed.last_synced_at && <span className="text-xs text-gray-400">Sync pending…</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={syncNow} disabled={syncing}
                            className="text-xs text-indigo-600 hover:text-indigo-500 border border-indigo-200 rounded-lg px-3 py-1.5 transition disabled:opacity-40">
                            {syncing ? 'Syncing…' : '↻ Sync now'}
                        </button>
                        <button onClick={remove}
                            className="text-xs text-red-400 hover:text-red-600 border border-red-100 rounded-lg px-3 py-1.5 transition">
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Edit() {
    const { property, userMeta, icalFeed, errors = {} } = usePage().props
    const isPro = userMeta?.plan === 'pro'

    const { data, setData, post, processing } = useForm({
        _method: 'put',
        title: property.title ?? '',
        address: property.address ?? '',
        wifi_name: property.wifi_name ?? '',
        wifi_password: property.wifi_password ?? '',
        notes: property.notes ?? '',
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
        brand_display_name: property.brand_display_name ?? '',
        brand_contact_label: property.brand_contact_label ?? '',
        brand_logo_path: property.brand_logo_path ?? '',
        brand_logo_file: null,
    })

    const submit = (e) => {
        e.preventDefault()
        post(route('properties.update', property.id), { preserveScroll: true, forceFormData: true })
    }

    return (
        <Shell title="Edit Property">
            <Head title="Edit Property" />

            <div className="max-w-2xl mx-auto">
                {/* Page header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Link href={route('host.dashboard')} className="hover:text-gray-600">Dashboard</Link>
                        <span>›</span>
                        <span className="text-gray-600">{property.title || 'Edit property'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit property</h1>
                    <p className="text-sm text-gray-400 mt-1">{property.address}</p>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Please fix the highlighted fields below.
                    </div>
                )}

                <PropertyForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    mode="edit"
                    isPro={isPro}
                />

                <IcalSection property={property} feed={icalFeed} />
            </div>
        </Shell>
    )
}
