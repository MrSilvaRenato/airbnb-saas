import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

const TRIGGER_LABELS = {
    booking_confirmed: 'Booking Confirmed (sent ~2 min after stay created)',
    checkin_reminder:  'Check-in Reminder (sent before check-in)',
    checkin_day:       'Check-in Day (sent at 8 AM on arrival day)',
    checkout_reminder: 'Check-out Reminder (sent before check-out)',
};

const VARIABLES = ['{{guest_name}}', '{{property}}', '{{checkin}}', '{{checkout}}', '{{link}}', '{{host_name}}', '{{wifi_name}}', '{{wifi_pass}}', '{{smart_lock}}'];

function TemplateCard({ template, onSaved }) {
    const [open, setOpen] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        subject:            template.subject,
        body:               template.body,
        send_offset_hours:  template.send_offset_hours ?? 0,
        enabled:            template.enabled,
    });

    const save = (e) => {
        e.preventDefault();
        patch(route('messaging.templates.update', template.id), {
            onSuccess: () => { setOpen(false); onSaved?.(); },
        });
    };

    const insertVar = (v) => {
        setData('body', data.body + v);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${template.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{TRIGGER_LABELS[template.trigger] ?? template.trigger}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{template.subject}</p>
                    </div>
                </div>
                <button onClick={() => setOpen(o => !o)}
                    className="text-sm text-indigo-600 font-medium hover:underline">
                    {open ? 'Close' : 'Edit'}
                </button>
            </div>

            {/* Expand */}
            {open && (
                <form onSubmit={save} className="border-t border-gray-100 px-5 py-5 space-y-4">
                    {/* Enabled toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={data.enabled}
                                onChange={e => setData('enabled', e.target.checked)} />
                            <div className={`w-10 h-5 rounded-full transition-colors ${data.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.enabled ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-sm text-gray-700">Enabled</span>
                    </label>

                    {/* Offset (checkin_reminder / checkout_reminder only) */}
                    {['checkin_reminder', 'checkout_reminder'].includes(template.trigger) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Send offset (hours before event, use negative)</label>
                            <input type="number" value={data.send_offset_hours}
                                onChange={e => setData('send_offset_hours', parseInt(e.target.value))}
                                className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                            <p className="text-xs text-gray-400 mt-1">e.g. -48 = 48 hours before check-in</p>
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                        <input type="text" value={data.subject}
                            onChange={e => setData('subject', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Message body</label>
                        {/* Variable chips */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {VARIABLES.map(v => (
                                <button key={v} type="button" onClick={() => insertVar(v)}
                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2 py-0.5 hover:bg-indigo-100">
                                    {v}
                                </button>
                            ))}
                        </div>
                        <textarea rows={6} value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y" />
                        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save template'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)}
                            className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Templates({ templates, flash }) {
    return (
        <Shell title="Automated Messages">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Automated Messages</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        HostFlows sends these emails to your guests automatically based on their stay dates. Click <strong>Edit</strong> on any template to customise it.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Info box */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-800 mb-6">
                    <strong>How it works:</strong> When you create a stay (or it's synced from Airbnb), these messages are scheduled automatically. They are sent from your HostFlows account and include a link to the guest's welcome guide.
                </div>

                <div className="space-y-3">
                    {templates.map(t => (
                        <TemplateCard key={t.id} template={t} />
                    ))}
                </div>

                {templates.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">✉️</p>
                        <p>No templates found. Refresh to seed defaults.</p>
                    </div>
                )}
            </div>
        </Shell>
    );
}
