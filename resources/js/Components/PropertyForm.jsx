import React, { useState } from 'react'

const INPUT = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
const TEXTAREA = INPUT + ' resize-none'

function FieldError({ msg }) {
    if (!msg) return null
    return <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {msg}</p>
}

function SectionCard({ color, icon, title, subtitle, children }) {
    const accent = {
        indigo: 'bg-indigo-100 text-indigo-600',
        violet: 'bg-violet-100 text-violet-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        amber:  'bg-amber-100 text-amber-600',
    }[color]
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-6">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${accent}`}>{icon}</div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
                </div>
            </div>
            {children}
        </div>
    )
}

function Field({ label, hint, error, children, half }) {
    return (
        <div className={half ? '' : ''}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
            {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
            {children}
            <FieldError msg={error} />
        </div>
    )
}

const WELCOME_ITEMS = [
    { key: 'default_arrival_tips',      label: 'Arrival & how to find it',  icon: '📍', placeholder: 'Gate code, building entrance, lift access, where to park to unload...' },
    { key: 'default_parking_info',      label: 'Transport & parking',       icon: '🚗', placeholder: 'Visitor bay #12. Max height 2.1m. Best Uber drop-off is the laneway on Smith St.' },
    { key: 'default_rules_summary',     label: 'House rules',               icon: '📋', placeholder: 'No parties. Quiet hours after 10pm. No unregistered guests overnight.' },
    { key: 'default_emergency_info',    label: 'Emergencies & safety',      icon: '🆘', placeholder: '000 for emergencies. Fire extinguisher under kitchen sink.' },
    { key: 'default_appliances_notes',  label: 'Appliances & how-tos',      icon: '🔧', placeholder: 'Dishwasher: hold power 2s then press Start...' },
    { key: 'default_garbage_recycling', label: 'Garbage & recycling',       icon: '♻️', placeholder: 'Red = landfill, yellow = recycling, green = organics. Bins in carpark B1.' },
    { key: 'default_safety_notes',      label: 'Safety notes',              icon: '⚠️', placeholder: 'Balcony rail is waist height, supervise kids. BBQ gas OFF when not in use.' },
    { key: 'default_checkout_list',     label: 'Check-out checklist',       icon: '✅', placeholder: 'Run dishwasher, empty bins, towels in bathroom, A/C off, lock up.' },
]

export default function PropertyForm({ data, setData, errors = {}, processing, onSubmit, mode = 'create', isPro = false }) {
    const [openKey, setOpenKey] = useState(null)

    const filledCount = WELCOME_ITEMS.filter(i => !!data[i.key]).length

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-4">

            {/* 1 · Property Identity */}
            <SectionCard color="indigo" title="Property Identity" subtitle="How this property appears in your dashboard, calendar and reports."
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
            >
                <div className="space-y-4">
                    <Field label="Full address *" error={errors.address}>
                        <input className={INPUT} placeholder="123 Beach Rd, Byron Bay NSW 2481" required value={data.address} onChange={e => setData('address', e.target.value)} />
                    </Field>
                    <Field label="Display name *" hint="Short name used in your calendar and reports — e.g. 'Byron Loft' or 'CBD 2BR'." error={errors.title}>
                        <input className={INPUT} placeholder="Coastal Loft" required value={data.title} onChange={e => setData('title', e.target.value)} />
                    </Field>
                    <Field label="Internal notes" hint="Private — only visible to you. Great for lockbox codes, body corporate contacts, quirks." error={errors.notes}>
                        <textarea className={TEXTAREA} rows={3} placeholder="Lockbox behind pillar. Body corporate strict about noise after 10pm." value={data.notes} onChange={e => setData('notes', e.target.value)} />
                    </Field>
                </div>
            </SectionCard>

            {/* 2 · Access & Connectivity */}
            <SectionCard color="violet" title="Access & Connectivity" subtitle="Wi-Fi and access details shown to guests on their welcome page."
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>}
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Wi-Fi name" error={errors.wifi_name}>
                        <input className={INPUT} placeholder="HomeNetwork_5G" value={data.wifi_name} onChange={e => setData('wifi_name', e.target.value)} />
                    </Field>
                    <Field label="Wi-Fi password" error={errors.wifi_password}>
                        <input className={INPUT} placeholder="SuperSecret123" value={data.wifi_password} onChange={e => setData('wifi_password', e.target.value)} />
                    </Field>
                    <Field label="Host phone (visible to guests)" error={errors.default_host_phone}>
                        <input className={INPUT} placeholder="+61 400 000 000" value={data.default_host_phone} onChange={e => setData('default_host_phone', e.target.value)} />
                    </Field>
                    <Field label="Smart lock / access code" error={errors.default_smart_lock_code}>
                        <input className={INPUT} placeholder="A12B#4099" value={data.default_smart_lock_code} onChange={e => setData('default_smart_lock_code', e.target.value)} />
                    </Field>
                </div>
            </SectionCard>

            {/* 3 · Guest Welcome Defaults */}
            <SectionCard color="emerald" title="Guest Welcome Info" subtitle={`Pre-fills every new stay created for this property. ${filledCount} of ${WELCOME_ITEMS.length} sections filled.`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
            >
                <div className="space-y-2">
                    {WELCOME_ITEMS.map(({ key, label, icon, placeholder }) => {
                        const isOpen = openKey === key
                        const filled = !!data[key]
                        return (
                            <div key={key} className={`rounded-xl border transition-all overflow-hidden ${isOpen ? 'border-indigo-200' : filled ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100 bg-gray-50/60'}`}>
                                <button type="button" onClick={() => setOpenKey(isOpen ? null : key)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                >
                                    <span className="text-base w-5 text-center">{icon}</span>
                                    <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                                    {filled && !isOpen && (
                                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">filled</span>
                                    )}
                                    <svg className={`w-4 h-4 text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-4 pt-0">
                                        <textarea className={TEXTAREA} rows={4} placeholder={placeholder} value={data[key]} onChange={e => setData(key, e.target.value)} autoFocus />
                                        <FieldError msg={errors[key]} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Tap any section to expand. You can still edit these per-guest when creating a stay.
                </p>
            </SectionCard>

            {/* 4 · Branding */}
            {isPro ? (
                <SectionCard color="amber" title="Guest-Facing Branding" subtitle="Your logo and name shown on the guest welcome page — replaces the default HostFlows header."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>}
                >
                    <div className="space-y-4">
                        <Field label="Display name / headline" error={errors.brand_display_name}>
                            <input className={INPUT} placeholder="Coastal Escapes — Matt & Rafa" value={data.brand_display_name} onChange={e => setData('brand_display_name', e.target.value)} />
                        </Field>
                        <Field label="Contact label" error={errors.brand_contact_label}>
                            <input className={INPUT} placeholder="Text us anytime" value={data.brand_contact_label} onChange={e => setData('brand_contact_label', e.target.value)} />
                        </Field>
                        <Field label="Property logo / badge" hint="PNG, JPG or WEBP · max 4 MB · square works best." error={errors.brand_logo_file}>
                            {data.brand_logo_path ? (
                                <div className="flex items-center gap-4 mb-3">
                                    <img src={data.brand_logo_path} alt="Logo" className="w-16 h-16 rounded-xl border object-cover" />
                                    <span className="text-xs text-gray-400">Currently shown on guest welcome page.</span>
                                </div>
                            ) : null}
                            <input type="file" accept="image/png,image/jpeg,image/webp"
                                onChange={e => setData('brand_logo_file', e.target.files[0] || null)}
                                className="block w-full text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                            />
                        </Field>
                    </div>
                </SectionCard>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">Guest-Facing Branding <span className="ml-1.5 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Pro</span></div>
                        <div className="text-xs text-gray-400 mt-0.5">Add your logo and brand name to the guest welcome page. Available on Pro plan.</div>
                    </div>
                    <a href={route('checkout.show')} className="shrink-0 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition">
                        Upgrade
                    </a>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pb-6">
                <button type="submit" disabled={processing}
                    className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition"
                >
                    {processing ? 'Saving…' : mode === 'create' ? 'Create Property' : 'Save Changes'}
                </button>
                <a href={route('host.dashboard')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                </a>
            </div>
        </form>
    )
}
