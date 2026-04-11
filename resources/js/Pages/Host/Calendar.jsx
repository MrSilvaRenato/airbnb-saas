import React, { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'

const COLORS = [
    { bar: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
    { bar: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    { bar: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
    { bar: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
    { bar: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
    { bar: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-700',    dot: 'bg-teal-500'    },
    { bar: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
    { bar: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
]

function fmt(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function fmtDay(d) {
    const dt = new Date(d + 'T00:00:00')
    return { day: dt.toLocaleDateString(undefined, { weekday: 'short' }), date: dt.getDate() }
}
function nights(cin, cout) {
    return Math.round((new Date(cout + 'T00:00:00') - new Date(cin + 'T00:00:00')) / 86400000)
}

export default function Calendar() {
    const { stays, properties, days, startDate, prevStart, nextStart } = usePage().props
    const [selected, setSelected] = useState(null)
    const [filterProp, setFilterProp] = useState('all')

    const today = new Date().toISOString().slice(0, 10)

    const filtered = filterProp === 'all' ? stays : stays.filter(s => String(s.property_id) === String(filterProp))

    // Group stays by property
    const staysByProp = {}
    properties.forEach(p => { staysByProp[p.id] = filtered.filter(s => s.property_id === p.id) })

    function navigate(start) {
        router.get(route('host.calendar'), { start }, { preserveState: false })
    }

    // For a given stay, compute which days it occupies (indices in `days`)
    function getStaySpan(stay) {
        const start = days.findIndex(d => d === stay.check_in_date)
        const end   = days.findIndex(d => d === stay.check_out_date)
        // clamp to visible range
        const s = start === -1 ? 0 : start
        const e = end   === -1 ? days.length - 1 : end
        return { s, e, width: e - s + 1 }
    }

    const rangeLabel = `${fmt(days[0])} — ${fmt(days[days.length - 1])}`

    // month groups for header
    const monthGroups = []
    days.forEach((d, i) => {
        const m = d.slice(0, 7)
        if (!monthGroups.length || monthGroups[monthGroups.length - 1].month !== m) {
            monthGroups.push({ month: m, label: new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), count: 1, start: i })
        } else {
            monthGroups[monthGroups.length - 1].count++
        }
    })

    const COL = 40 // px per day column
    const ROW = 52 // px per property row
    const LABEL_W = 180 // px for property label

    return (
        <Shell title="Calendar">
            <Head title="Calendar" />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Occupancy Timeline</h1>
                    <p className="text-sm text-gray-400">{rangeLabel} · {filtered.length} stays</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={filterProp}
                        onChange={e => setFilterProp(e.target.value)}
                        className="text-sm border rounded-lg px-3 py-2 bg-white"
                    >
                        <option value="all">All properties</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                        <button onClick={() => navigate(prevStart)} className="p-2 rounded-lg border hover:bg-gray-50 text-lg">‹</button>
                        <button onClick={() => navigate(new Date().toISOString().slice(0,10))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Today</button>
                        <button onClick={() => navigate(nextStart)} className="p-2 rounded-lg border hover:bg-gray-50 text-lg">›</button>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border bg-white shadow-sm overflow-auto">
                <div style={{ minWidth: LABEL_W + COL * days.length }}>

                    {/* Month headers */}
                    <div className="flex border-b bg-gray-50">
                        <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="shrink-0 border-r" />
                        {monthGroups.map((mg, i) => (
                            <div key={i} style={{ width: COL * mg.count }} className="border-r text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
                                {mg.label}
                            </div>
                        ))}
                    </div>

                    {/* Day headers */}
                    <div className="flex border-b">
                        <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="shrink-0 border-r px-3 py-2 text-xs text-gray-400 font-medium">Property</div>
                        {days.map(d => {
                            const { day, date } = fmtDay(d)
                            const isToday = d === today
                            return (
                                <div key={d} style={{ width: COL, minWidth: COL }} className={`border-r flex flex-col items-center py-1.5 ${isToday ? 'bg-indigo-50' : ''}`}>
                                    <span className="text-[10px] text-gray-400">{day}</span>
                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>{date}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Property rows */}
                    {properties.map((prop, pi) => {
                        const c = COLORS[prop.color_index % COLORS.length]
                        const propStays = staysByProp[prop.id] || []

                        return (
                            <div key={prop.id} className="flex border-b last:border-b-0 hover:bg-gray-50/50 group" style={{ height: ROW }}>
                                {/* Property label */}
                                <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="shrink-0 border-r px-3 flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                                    <span className="text-xs font-medium text-gray-700 truncate">{prop.title}</span>
                                </div>

                                {/* Day cells + stay bars */}
                                <div className="relative flex-1 flex">
                                    {/* Grid lines */}
                                    {days.map(d => (
                                        <div key={d} style={{ width: COL, minWidth: COL }} className={`border-r h-full ${d === today ? 'bg-indigo-50/60' : ''}`} />
                                    ))}

                                    {/* Stay bars — absolute positioned */}
                                    {propStays.map(stay => {
                                        const { s, e, width } = getStaySpan(stay)
                                        if (width <= 0) return null
                                        return (
                                            <button
                                                key={stay.id}
                                                onClick={() => setSelected(selected?.id === stay.id ? null : stay)}
                                                style={{
                                                    position: 'absolute',
                                                    left: s * COL + 3,
                                                    width: width * COL - 6,
                                                    top: 8,
                                                    height: ROW - 16,
                                                }}
                                                className={`rounded-lg flex items-center px-2 gap-1.5 text-left overflow-hidden transition-all hover:brightness-95 active:scale-[0.99] ${c.bar}`}
                                                title={`${stay.guest_name} · ${fmt(stay.check_in_date)} → ${fmt(stay.check_out_date)}`}
                                            >
                                                <svg className="w-3 h-3 text-white/70 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                                <span className="text-white text-[11px] font-semibold truncate">{stay.guest_name || 'Guest'}</span>
                                                {width >= 3 && (
                                                    <span className="text-white/60 text-[10px] shrink-0">{nights(stay.check_in_date, stay.check_out_date)}n</span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Stay detail popover */}
            {selected && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setSelected(null)} />
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl border p-4 z-50">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-gray-900">{selected.guest_name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{properties.find(p => p.id === selected.property_id)?.title}</div>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl leading-none">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-50 rounded-xl p-2.5">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Check-in</div>
                                <div className="text-sm font-semibold">{fmt(selected.check_in_date)}</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Check-out</div>
                                <div className="text-sm font-semibold">{fmt(selected.check_out_date)}</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Nights</div>
                                <div className="text-sm font-semibold">{nights(selected.check_in_date, selected.check_out_date)}</div>
                            </div>
                            {selected.price_total && (
                                <div className="bg-gray-50 rounded-xl p-2.5">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Revenue</div>
                                    <div className="text-sm font-semibold">${Number(selected.price_total).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                        <Link href={selected.edit_url} className="block w-full text-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black">
                            View Stay
                        </Link>
                    </div>
                </>
            )}

            {/* Empty */}
            {filtered.length === 0 && (
                <div className="mt-10 text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <div className="font-medium text-gray-600">No stays in this period</div>
                </div>
            )}
        </Shell>
    )
}
