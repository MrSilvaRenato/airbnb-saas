import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'

const STATUS = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    denied:   'bg-red-100 text-red-600',
}

export default function RefundRequests({ refunds, pending }) {
    const [notes, setNotes] = useState({})

    const act = (id, action) => {
        router.post(route(action, id), { admin_notes: notes[id] || '' }, { preserveScroll: true })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Head title="Refund Requests — Admin" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Refund Requests</h1>
                        <p className="text-sm text-gray-400">{pending} pending review</p>
                    </div>
                    <a href={route('admin.dashboard')} className="text-sm text-gray-500 hover:text-gray-800">← Admin</a>
                </div>

                {refunds.length === 0 ? (
                    <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">No refund requests yet.</div>
                ) : (
                    <div className="space-y-4">
                        {refunds.map(r => (
                            <div key={r.id} className="bg-white rounded-2xl border shadow-sm p-5">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <div className="font-semibold text-gray-900">{r.user_name} <span className="text-gray-400 font-normal text-sm">— {r.user_email}</span></div>
                                        <div className="text-xs text-gray-400 mt-0.5">{r.created_at} · Subscribed: {r.sub_started ?? 'unknown'} · Plan: <b>{r.plan}</b> · A${r.amount}</div>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS[r.status]}`}>{r.status}</span>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 mb-4">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Customer reason</span>
                                    {r.reason}
                                </div>

                                {r.admin_notes && (
                                    <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700 mb-4">
                                        <span className="text-xs font-semibold uppercase tracking-wide block mb-1">Admin notes</span>
                                        {r.admin_notes}
                                    </div>
                                )}

                                {r.status === 'pending' && (
                                    <div className="space-y-2">
                                        <textarea
                                            rows={2}
                                            placeholder="Add notes (optional — shown to customer)"
                                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                            value={notes[r.id] || ''}
                                            onChange={e => setNotes(v => ({ ...v, [r.id]: e.target.value }))}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => act(r.id, 'admin.refunds.approve')}
                                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">
                                                Approve refund
                                            </button>
                                            <button onClick={() => act(r.id, 'admin.refunds.deny')}
                                                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
