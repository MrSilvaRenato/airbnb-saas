import React, { useState, useMemo } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'

// IMPORTANT: Static color arrays — never build dynamically or Tailwind JIT purges them
const STAY_COLORS = [
    { bg: 'bg-sky-200',    text: 'text-sky-900',    border: 'border-sky-300' },
    { bg: 'bg-violet-200', text: 'text-violet-900', border: 'border-violet-300' },
    { bg: 'bg-emerald-200',text: 'text-emerald-900',border: 'border-emerald-300' },
    { bg: 'bg-amber-200',  text: 'text-amber-900',  border: 'border-amber-300' },
    { bg: 'bg-rose-200',   text: 'text-rose-900',   border: 'border-rose-300' },
    { bg: 'bg-indigo-200', text: 'text-indigo-900', border: 'border-indigo-300' },
    { bg: 'bg-teal-200',   text: 'text-teal-900',   border: 'border-teal-300' },
    { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300' },
]

function buildCalendarGrid(yearMonth) {
    // yearMonth = 'YYYY-MM'
    const [year, month] = yearMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay  = new Date(year, month, 0)

    // Sunday-first: 0=Sun ... 6=Sat
    const startOffset = firstDay.getDay()
    const totalCells  = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

    const cells = []
    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startOffset + 1
        if (dayNum < 1 || dayNum > lastDay.getDate()) {
            cells.push(null)
        } else {
            const d = String(dayNum).padStart(2, '0')
            const m = String(month).padStart(2, '0')
            cells.push(`${year}-${m}-${d}`)
        }
    }
    return cells
}

function staysForDay(stays, dateStr) {
    if (!dateStr) return []
    return stays.filter(s => s.check_in_date <= dateStr && s.check_out_date > dateStr)
}

function prevMonth(ym) {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym) {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
    const { stays, properties, currentMonth, monthLabel } = usePage().props

    const [selectedStay, setSelectedStay] = useState(null)

    const grid = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])

    const todayStr = new Date().toISOString().slice(0, 10)

    function navigate(ym) {
        router.get(route('host.calendar'), { month: ym }, { preserveState: false })
    }

    return (
        <Shell title="Calendar">
            <Head title="Calendar" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{monthLabel}</h1>
                    <p className="text-sm text-gray-500">{stays.length} stay{stays.length !== 1 ? 's' : ''} this period</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(prevMonth(currentMonth))}
                        className="p-2 rounded-lg border hover:bg-gray-50"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => navigate(todayStr.slice(0, 7))}
                        className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => navigate(nextMonth(currentMonth))}
                        className="p-2 rounded-lg border hover:bg-gray-50"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Property legend */}
            {properties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {properties.map(p => {
                        const c = STAY_COLORS[p.color_index % STAY_COLORS.length]
                        return (
                            <span key={p.id} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                                {p.title}
                            </span>
                        )
                    })}
                </div>
            )}

            {/* Calendar grid */}
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                {/* Day labels */}
                <div className="grid grid-cols-7 border-b">
                    {DAY_LABELS.map(d => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {grid.map((dateStr, idx) => {
                        const dayStays = staysForDay(stays, dateStr)
                        const isToday = dateStr === todayStr
                        const isCurrentMonth = dateStr && dateStr.slice(0, 7) === currentMonth

                        return (
                            <div
                                key={idx}
                                className={`min-h-[80px] p-1 border-b border-r relative ${
                                    !isCurrentMonth ? 'bg-gray-50' : ''
                                } ${isToday ? 'bg-indigo-50' : ''}`}
                            >
                                {dateStr && (
                                    <>
                                        <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                                            isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                                        }`}>
                                            {parseInt(dateStr.split('-')[2])}
                                        </div>

                                        <div className="space-y-0.5">
                                            {dayStays.slice(0, 2).map(stay => {
                                                const c = STAY_COLORS[stay.color_index % STAY_COLORS.length]
                                                const isStart = stay.check_in_date === dateStr
                                                return (
                                                    <button
                                                        key={stay.id}
                                                        onClick={() => setSelectedStay(selectedStay?.id === stay.id ? null : stay)}
                                                        className={`w-full text-left text-[10px] font-medium px-1 py-0.5 rounded truncate ${c.bg} ${c.text} hover:opacity-80`}
                                                    >
                                                        {isStart ? `↳ ${stay.guest_name || stay.property_title}` : '─'}
                                                    </button>
                                                )
                                            })}
                                            {dayStays.length > 2 && (
                                                <div className="text-[10px] text-gray-400 pl-1">+{dayStays.length - 2} more</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Stay popover */}
            {selectedStay && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border p-4 z-50">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-semibold text-gray-900">{selectedStay.guest_name || 'Guest'}</div>
                            <div className="text-xs text-gray-500">{selectedStay.property_title}</div>
                        </div>
                        <button onClick={() => setSelectedStay(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                        {selectedStay.check_in_date} → {selectedStay.check_out_date}
                    </div>
                    <Link
                        href={selectedStay.edit_url}
                        className="block w-full text-center px-4 py-2 bg-black text-white rounded-lg text-sm"
                    >
                        Edit Stay
                    </Link>
                </div>
            )}

            {/* Empty state */}
            {stays.length === 0 && (
                <div className="mt-8 text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">📅</div>
                    <div className="font-medium">No stays this month</div>
                    <div className="text-sm mt-1">Create a stay from the dashboard to see it here.</div>
                </div>
            )}
        </Shell>
    )
}
