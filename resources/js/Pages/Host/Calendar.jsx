import React, { useState, useMemo } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'

const COLORS = [
    { bg: 'bg-indigo-100',   text: 'text-indigo-800',   dot: 'bg-indigo-500'   },
    { bg: 'bg-emerald-100',  text: 'text-emerald-800',  dot: 'bg-emerald-500'  },
    { bg: 'bg-amber-100',    text: 'text-amber-800',    dot: 'bg-amber-500'    },
    { bg: 'bg-rose-100',     text: 'text-rose-800',     dot: 'bg-rose-500'     },
    { bg: 'bg-violet-100',   text: 'text-violet-800',   dot: 'bg-violet-500'   },
    { bg: 'bg-teal-100',     text: 'text-teal-800',     dot: 'bg-teal-500'     },
    { bg: 'bg-orange-100',   text: 'text-orange-800',   dot: 'bg-orange-500'   },
    { bg: 'bg-sky-100',      text: 'text-sky-800',      dot: 'bg-sky-500'      },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildGrid(yearMonth) {
    const [y, m] = yearMonth.split('-').map(Number)
    const firstDay = new Date(y, m - 1, 1)
    const lastDay  = new Date(y, m, 0)
    const offset   = firstDay.getDay()
    const total    = Math.ceil((offset + lastDay.getDate()) / 7) * 7
    const cells    = []
    for (let i = 0; i < total; i++) {
        const day = i - offset + 1
        if (day < 1 || day > lastDay.getDate()) { cells.push(null); continue }
        cells.push(`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`)
    }
    return cells
}

function prevMonth(ym) {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function nextMonth(ym) {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m, 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function fmtDate(d) {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function nights(cin, cout) {
    return Math.round((new Date(cout+'T00:00:00') - new Date(cin+'T00:00:00')) / 86400000)
}

// FIX: inclusive check-in and check-out (guest is there on both days)
function staysForDay(stays, dateStr) {
    if (!dateStr) return []
    return stays.filter(s => s.check_in_date <= dateStr && s.check_out_date >= dateStr)
}

export default function Calendar() {
    const { stays, properties, currentMonth, monthLabel } = usePage().props

    const [selectedStay, setSelectedStay]   = useState(null)
    const [filterPropId, setFilterPropId]   = useState('all')

    const todayStr = new Date().toISOString().slice(0,10)

    const filteredStays = useMemo(() =>
        filterPropId === 'all' ? stays : stays.filter(s => String(s.property_id) === String(filterPropId))
    , [stays, filterPropId])

    const grid = useMemo(() => buildGrid(currentMonth), [currentMonth])

    function navigate(ym) {
        router.get(route('host.calendar'), { month: ym }, { preserveState: false })
    }

    return (
        <Shell title="Calendar">
            <Head title="Calendar" />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{monthLabel}</h1>
                    <p className="text-sm text-gray-400">{filteredStays.length} stay{filteredStays.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Property filter */}
                    <select
                        value={filterPropId}
                        onChange={e => setFilterPropId(e.target.value)}
                        className="text-sm border rounded-lg px-3 py-2 bg-white"
                    >
                        <option value="all">All properties</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    {/* Month nav */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => navigate(prevMonth(currentMonth))} className="p-2 rounded-lg border hover:bg-gray-50 text-lg leading-none">‹</button>
                        <button onClick={() => navigate(todayStr.slice(0,7))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Today</button>
                        <button onClick={() => navigate(nextMonth(currentMonth))} className="p-2 rounded-lg border hover:bg-gray-50 text-lg leading-none">›</button>
                    </div>
                </div>
            </div>

            {/* Property legend */}
            <div className="flex flex-wrap gap-2 mb-4">
                {properties.map(p => {
                    const c = COLORS[p.color_index % COLORS.length]
                    const active = filterPropId === 'all' || String(filterPropId) === String(p.id)
                    return (
                        <button
                            key={p.id}
                            onClick={() => setFilterPropId(String(filterPropId) === String(p.id) ? 'all' : String(p.id))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                active ? `${c.bg} ${c.text} border-transparent` : 'bg-white text-gray-400 border-gray-200'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                            {p.title}
                        </button>
                    )
                })}
            </div>

            {/* Calendar */}
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b bg-gray-50">
                    {DAY_LABELS.map(d => (
                        <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
                    ))}
                </div>

                {/* Cells */}
                <div className="grid grid-cols-7">
                    {grid.map((dateStr, idx) => {
                        const dayStays  = staysForDay(filteredStays, dateStr)
                        const isToday   = dateStr === todayStr
                        const inMonth   = dateStr && dateStr.slice(0,7) === currentMonth

                        return (
                            <div
                                key={idx}
                                className={`min-h-[90px] p-1.5 border-b border-r ${!inMonth ? 'bg-gray-50/60' : ''} ${isToday ? 'bg-indigo-50' : ''}`}
                            >
                                {dateStr && (
                                    <>
                                        <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                                            isToday ? 'bg-indigo-600 text-white' : inMonth ? 'text-gray-800' : 'text-gray-300'
                                        }`}>
                                            {parseInt(dateStr.split('-')[2])}
                                        </div>

                                        <div className="space-y-0.5">
                                            {dayStays.slice(0,3).map(stay => {
                                                const c        = COLORS[stay.color_index % COLORS.length]
                                                const isStart  = stay.check_in_date === dateStr
                                                const isEnd    = stay.check_out_date === dateStr
                                                return (
                                                    <button
                                                        key={stay.id}
                                                        onClick={() => setSelectedStay(selectedStay?.id === stay.id ? null : stay)}
                                                        className={`w-full text-left text-[10px] font-medium px-1.5 py-0.5 truncate transition-opacity hover:opacity-75 ${c.bg} ${c.text} ${
                                                            isStart ? 'rounded-l-full rounded-r-sm' : isEnd ? 'rounded-r-full rounded-l-sm' : 'rounded-none'
                                                        }`}
                                                    >
                                                        {isStart ? stay.guest_name || '—' : ' '}
                                                    </button>
                                                )
                                            })}
                                            {dayStays.length > 3 && (
                                                <div className="text-[10px] text-gray-400 pl-1">+{dayStays.length - 3}</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Stay detail popover */}
            {selectedStay && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setSelectedStay(null)} />
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl border p-4 z-50">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-gray-900">{selectedStay.guest_name || 'Guest'}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{selectedStay.property_title}</div>
                            </div>
                            <button onClick={() => setSelectedStay(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <span>{fmtDate(selectedStay.check_in_date)}</span>
                            <span className="text-gray-300">→</span>
                            <span>{fmtDate(selectedStay.check_out_date)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-4">
                            {nights(selectedStay.check_in_date, selectedStay.check_out_date)} nights
                        </div>
                        <Link
                            href={selectedStay.edit_url}
                            className="block w-full text-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
                        >
                            Edit Stay
                        </Link>
                    </div>
                </>
            )}

            {/* Empty state */}
            {filteredStays.length === 0 && (
                <div className="mt-10 text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📅</div>
                    <div className="font-medium text-gray-600">No stays this month</div>
                    <div className="text-sm mt-1">{filterPropId !== 'all' ? 'Try showing all properties.' : 'Create a stay from the dashboard.'}</div>
                </div>
            )}
        </Shell>
    )
}
