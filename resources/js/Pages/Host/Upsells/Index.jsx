import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

const STATUS_BADGE = {
    pending:  'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-600',
};

function OfferForm({ property, onAdded }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '', description: '', price: '', enabled: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('upsells.store', property.id), { onSuccess: () => { reset(); onAdded?.(); } });
    };

    return (
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-gray-800 text-sm">Add new offer</p>
            <input type="text" placeholder="Title (e.g. Late Checkout)" value={data.title}
                onChange={e => setData('title', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            <textarea placeholder="Description (optional)" value={data.description}
                onChange={e => setData('description', e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none" />
            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-500">A$</span>
                    <input type="number" step="0.01" min="0" placeholder="Price (blank = inquiry)"
                        value={data.price} onChange={e => setData('price', e.target.value)}
                        className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-sm" />
                </div>
                <button type="submit" disabled={processing}
                    className="ml-auto bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    {processing ? 'Adding…' : 'Add offer'}
                </button>
            </div>
        </form>
    );
}

function OfferCard({ offer }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        title: offer.title, description: offer.description ?? '', price: offer.price ?? '', enabled: offer.enabled,
    });

    const save = (e) => {
        e.preventDefault();
        patch(route('upsells.update', offer.id), { onSuccess: () => setEditing(false) });
    };

    const destroy = () => {
        if (confirm('Delete this offer?')) {
            router.delete(route('upsells.destroy', offer.id));
        }
    };

    if (editing) {
        return (
            <form onSubmit={save} className="bg-white border border-indigo-200 rounded-2xl p-5 space-y-3">
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" />
                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                    rows={2} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none" />
                <div className="flex gap-3 items-center">
                    <span className="text-sm text-gray-500">A$</span>
                    <input type="number" step="0.01" min="0" value={data.price}
                        onChange={e => setData('price', e.target.value)}
                        className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2 ml-2 text-sm text-gray-600">
                        <input type="checkbox" checked={data.enabled} onChange={e => setData('enabled', e.target.checked)} />
                        Enabled
                    </label>
                    <button type="submit" disabled={processing}
                        className="ml-auto bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                        Save
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-400">Cancel</button>
                </div>
            </form>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${offer.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{offer.title}</p>
                {offer.description && <p className="text-gray-400 text-xs mt-0.5 truncate">{offer.description}</p>}
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                {offer.price ? `A$${parseFloat(offer.price).toFixed(2)}` : 'Inquiry'}
            </span>
            <span className="text-xs text-gray-400">{offer.requests_count} request{offer.requests_count !== 1 ? 's' : ''}</span>
            <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 font-medium hover:underline">Edit</button>
            <button onClick={destroy} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
    );
}

export default function UpsellsIndex({ property, offers, requests, orders = [], commission_rate = 0.15, flash }) {
    const [updatingReq, setUpdatingReq] = useState(false);
    const [tab, setTab] = useState('offers'); // offers | requests | orders

    const updateStatus = (id, status) => {
        setUpdatingReq(true);
        router.patch(route('upsells.requests.update', id), { status }, {
            onFinish: () => setUpdatingReq(false),
        });
    };

    const totalRevenue   = orders.filter(o => o.status === 'paid').reduce((s, o) => s + parseFloat(o.amount), 0);
    const totalCommission = orders.filter(o => o.status === 'paid').reduce((s, o) => s + parseFloat(o.commission), 0);
    const hostEarnings   = totalRevenue - totalCommission;

    return (
        <Shell title="Upsell Offers">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Upsell Offers</h1>
                    <p className="text-gray-500 text-sm mt-1">{property.title}</p>
                </div>

                {flash?.success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{flash.success}</div>
                )}

                {/* Revenue KPIs */}
                {orders.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-center">
                            <p className="text-xs text-green-600 font-medium">Total Sales</p>
                            <p className="text-xl font-bold text-green-700 mt-0.5">A${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-center">
                            <p className="text-xs text-indigo-600 font-medium">Your Earnings</p>
                            <p className="text-xl font-bold text-indigo-700 mt-0.5">A${hostEarnings.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-center">
                            <p className="text-xs text-gray-500 font-medium">Platform Fee</p>
                            <p className="text-xl font-bold text-gray-600 mt-0.5">A${totalCommission.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
                    {[['offers', 'Offers'], ['requests', `Requests (${requests.length})`], ['orders', `Paid Orders (${orders.filter(o=>o.status==='paid').length})`]].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Offers Tab */}
                {tab === 'offers' && (
                    <>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-800 mb-4">
                            <strong>How it works:</strong> Guests see these offers on their welcome guide. Priced offers show a <strong>"Pay now"</strong> Stripe button. Unpriced offers show a <strong>"Request"</strong> form. Platform takes {Math.round(commission_rate * 100)}% on paid orders.
                        </div>
                        <div className="space-y-3 mb-6">
                            {offers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No offers yet.</p>}
                            {offers.map(o => <OfferCard key={o.id} offer={o} />)}
                        </div>
                        <OfferForm property={property} />
                    </>
                )}

                {/* Requests Tab */}
                {tab === 'requests' && (
                    <div className="space-y-3">
                        {requests.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No requests yet.</p>}
                        {requests.map(r => (
                            <div key={r.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-gray-800">{r.offer}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{r.guest} · {r.created_at}</p>
                                        {r.message && <p className="text-xs text-gray-600 mt-1 italic">"{r.message}"</p>}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                                        {r.price && <span className="text-xs text-gray-500">A${parseFloat(r.price).toFixed(2)}</span>}
                                    </div>
                                </div>
                                {r.status === 'pending' && (
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => updateStatus(r.id, 'accepted')} disabled={updatingReq}
                                            className="text-xs bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">Accept</button>
                                        <button onClick={() => updateStatus(r.id, 'declined')} disabled={updatingReq}
                                            className="text-xs bg-red-50 text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50">Decline</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Paid Orders Tab */}
                {tab === 'orders' && (
                    <div className="space-y-3">
                        {orders.filter(o => o.status === 'paid').length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-8">No paid orders yet.</p>
                        )}
                        {orders.filter(o => o.status === 'paid').map(o => (
                            <div key={o.id} className="bg-white border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-4">
                                <span className="text-green-500 text-lg">✅</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800">{o.offer}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{o.guest} · {o.paid_at}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">A${parseFloat(o.amount).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">You earn: A${(parseFloat(o.amount) - parseFloat(o.commission)).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
