import React, { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import axios from 'axios'
import Shell from '@/Layouts/Shell'

const PLAN = {
    free: { label: 'Starter', price: 'Free',      color: 'bg-gray-100 text-gray-600' },
    host: { label: 'Host',    price: 'A$19 / mo',  color: 'bg-indigo-100 text-indigo-700' },
    pro:  { label: 'Pro',     price: 'A$49 / mo',  color: 'bg-emerald-100 text-emerald-700' },
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none">✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default function Manage({ plan, stripeStatus, planRenewsAt, planEndsAt, hasStripeCustomer, hasStripeSubscription, canRequestRefund, pendingRefund, daysSubscribed, checkoutRoute, portalRoute }) {
    const { flash = {} } = usePage().props
    const meta = PLAN[plan] ?? PLAN.free
    const isPaid = plan === 'host' || plan === 'pro'
    const isCancelling = !!planEndsAt

    const [modal, setModal] = useState(null) // 'cancel' | 'refund' | 'upgrade'
    const [refundReason, setRefundReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    function cancelSub() {
        setSubmitting(true)
        router.post(route('billing.cancel-subscription'), {}, {
            onFinish: () => { setSubmitting(false); setModal(null) },
        })
    }

    function submitRefund() {
        setSubmitting(true)
        router.post(route('billing.refund-request'), { reason: refundReason }, {
            onFinish: () => { setSubmitting(false); setModal(null) },
        })
    }

    async function upgradeTo(planKey) {
        setSubmitting(true)
        try {
            const res = await axios.post(route('billing.upgrade-subscription'), { plan: planKey })
            if (res?.data?.url) {
                window.location.href = res.data.url
            } else {
                router.reload()
                setModal(null)
            }
        } catch {
            alert('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Shell title="Billing">
            <Head title="Billing — HostFlows" />

            <div className="max-w-xl mx-auto py-8">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your plan, invoices, and payment details.</p>
                </div>

                {/* Flash messages */}
                {flash.success && (
                    <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">{flash.success}</div>
                )}
                {flash.error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">{flash.error}</div>
                )}

                {/* Current plan */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Current plan</div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{meta.price}</div>

                    {isPaid && planRenewsAt && !isCancelling && (
                        <p className="text-sm text-gray-400 mt-1">Renews on <b className="text-gray-600">{planRenewsAt}</b></p>
                    )}
                    {isCancelling && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                            <span>⚠</span> Subscription cancelled — access until <b>{planEndsAt}</b>
                        </div>
                    )}
                    {stripeStatus === 'past_due' && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            <span>⚠</span> Payment past due — please update your payment method below.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">

                    {/* Upgrade */}
                    {plan !== 'pro' && (
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Upgrade plan</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {plan === 'free' ? 'Unlock branding, analytics and more.' : 'Move to Pro — unlimited properties + full analytics.'}
                                </div>
                            </div>
                            <button onClick={() => setModal('upgrade')}
                                className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
                                Upgrade
                            </button>
                        </div>
                    )}

                    {/* Payment method / invoices */}
                    {hasStripeCustomer && (
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Payment method & invoices</div>
                                <div className="text-xs text-gray-400 mt-0.5">Update card, download receipts — via Stripe's secure portal.</div>
                            </div>
                            <button onClick={() => router.post(portalRoute)}
                                className="shrink-0 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                Manage
                            </button>
                        </div>
                    )}

                    {/* Cancel subscription */}
                    {isPaid && !isCancelling && hasStripeSubscription && (
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Cancel subscription</div>
                                <div className="text-xs text-gray-400 mt-0.5">You won't be charged next month. Access remains until {planRenewsAt ?? 'period end'}.</div>
                            </div>
                            <button onClick={() => setModal('cancel')}
                                className="shrink-0 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Refund request */}
                    {isPaid && hasStripeSubscription && (
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Request a refund</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {pendingRefund
                                        ? 'Your refund request is under review. We\'ll respond within 1–2 business days.'
                                        : canRequestRefund
                                            ? `Available within 7 days of subscribing (${daysSubscribed} days ago).`
                                            : 'Refund requests are only accepted within 7 days of subscribing.'}
                                </div>
                            </div>
                            {!pendingRefund && canRequestRefund ? (
                                <button onClick={() => setModal('refund')}
                                    className="shrink-0 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                                    Request
                                </button>
                            ) : pendingRefund ? (
                                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full shrink-0">Pending</span>
                            ) : (
                                <span className="text-xs text-gray-300 shrink-0">Not eligible</span>
                            )}
                        </div>
                    )}

                    {/* Free user CTA */}
                    {!isPaid && (
                        <div className="p-5">
                            <Link href={route('checkout.show')}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition">
                                View upgrade options
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link href={route('host.dashboard')} className="text-sm text-gray-400 hover:text-gray-700">← Back to dashboard</Link>
                </div>
            </div>

            {/* ── Cancel modal ── */}
            {modal === 'cancel' && (
                <Modal title="Cancel subscription" onClose={() => setModal(null)}>
                    <p className="text-sm text-gray-600 mb-2">Your subscription will be cancelled at the end of the current billing period.</p>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 mb-5">
                        <b>You keep full access until {planRenewsAt ?? 'period end'}.</b> After that, you'll move to the free plan automatically. No charge next month.
                    </div>
                    <div className="flex gap-2">
                        <button onClick={cancelSub} disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition">
                            {submitting ? 'Processing…' : 'Confirm cancellation'}
                        </button>
                        <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl border text-sm text-gray-600 hover:bg-gray-50">
                            Keep plan
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Refund modal ── */}
            {modal === 'refund' && (
                <Modal title="Request a refund" onClose={() => setModal(null)}>
                    <p className="text-sm text-gray-600 mb-1">Tell us why you'd like a refund. Our team will review and respond within <b>1–2 business days</b>.</p>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 mb-4">
                        Refunds are reviewed individually. Approval is not guaranteed for accounts with significant usage.
                    </div>
                    <textarea rows={4}
                        className="w-full border rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        placeholder="Please describe why you'd like a refund…"
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={submitRefund} disabled={submitting || refundReason.length < 10}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition">
                            {submitting ? 'Submitting…' : 'Submit request'}
                        </button>
                        <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl border text-sm text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Upgrade modal ── */}
            {modal === 'upgrade' && (
                <Modal title="Upgrade your plan" onClose={() => setModal(null)}>
                    <p className="text-sm text-gray-500 mb-4">
                        {hasStripeCustomer
                            ? 'Your subscription will be updated immediately. You\'ll be charged a prorated amount for the remainder of this billing cycle.'
                            : 'Choose a plan to get started.'}
                    </p>
                    <div className="space-y-3">
                        {plan !== 'host' && (
                            <button onClick={() => upgradeTo('host')} disabled={submitting}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition disabled:opacity-50">
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">Host plan</div>
                                    <div className="text-xs text-gray-400">5 properties · Branding · Analytics</div>
                                </div>
                                <div className="text-indigo-600 font-bold">A$19/mo</div>
                            </button>
                        )}
                        {plan !== 'pro' && (
                            <button onClick={() => upgradeTo('pro')} disabled={submitting}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition disabled:opacity-50">
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">Pro plan</div>
                                    <div className="text-xs text-gray-400">Unlimited · Maintenance · Auto-emails</div>
                                </div>
                                <div className="text-emerald-600 font-bold">A$49/mo</div>
                            </button>
                        )}
                    </div>
                </Modal>
            )}
        </Shell>
    )
}
