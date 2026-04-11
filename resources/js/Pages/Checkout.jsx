import React from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";

function IconCheck() {
    return (
        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
    )
}

function IconX() {
    return (
        <svg className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
    )
}

const PLANS = [
    {
        key: "free",
        name: "Starter",
        price: 0,
        priceLabel: "Free forever",
        pitch: "Perfect for trying HostFlows with your first property.",
        color: "gray",
        features: [
            { label: "1 property", ok: true },
            { label: "1 active stay at a time", ok: true },
            { label: "Guest welcome page", ok: true },
            { label: "QR code per stay", ok: true },
            { label: "Wi-Fi, lock code & house rules", ok: true },
            { label: "Custom branding", ok: false },
            { label: "Analytics dashboard", ok: false },
            { label: "Maintenance tracking", ok: false },
            { label: "Auto guest email on check-in", ok: false },
        ],
    },
    {
        key: "host",
        name: "Host",
        price: 19,
        pitch: "For active hosts who want professional branding and no limits on stays.",
        badge: "Most popular",
        highlight: true,
        features: [
            { label: "Up to 5 properties", ok: true },
            { label: "Unlimited active stays", ok: true },
            { label: "Guest welcome page", ok: true },
            { label: "QR code per stay", ok: true },
            { label: "Wi-Fi, lock code & house rules", ok: true },
            { label: "Custom branding (logo + header)", ok: true },
            { label: "Analytics dashboard", ok: true },
            { label: "Maintenance tracking", ok: false },
            { label: "Auto guest email on check-in", ok: false },
        ],
    },
    {
        key: "pro",
        name: "Pro",
        price: 49,
        pitch: "For property managers running multiple listings or short-stay agencies.",
        features: [
            { label: "Unlimited properties", ok: true },
            { label: "Unlimited active stays", ok: true },
            { label: "Guest welcome page", ok: true },
            { label: "QR code per stay", ok: true },
            { label: "Wi-Fi, lock code & house rules", ok: true },
            { label: "Custom branding (logo + header)", ok: true },
            { label: "Analytics dashboard — full", ok: true },
            { label: "Maintenance tracking", ok: true },
            { label: "Auto guest email on check-in", ok: true },
        ],
    },
];

const TESTIMONIALS = [
    { name: "Sarah M.", role: "Airbnb Superhost · 3 properties", quote: "My guests always comment on how professional the check-in page feels. Worth every cent." },
    { name: "James R.", role: "Short-stay investor · Brisbane", quote: "Saves me 30 minutes per guest. No more copy-pasting info into WhatsApp at midnight." },
    { name: "Priya K.", role: "Property manager · 8 listings", quote: "The maintenance tracking alone is worth the Pro plan. Finally have visibility across all properties." },
]

export default function Checkout({ userPlan, checkoutRoute }) {
    const [loading, setLoading] = React.useState(null)
    const [error, setError] = React.useState(null)

    const handleUpgrade = async (planKey) => {
        setLoading(planKey)
        setError(null)
        try {
            const res = await axios.post(checkoutRoute, { plan: planKey })
            if (res?.data?.url) {
                window.location.href = res.data.url
            } else {
                setError('Could not start checkout. Please try again.')
                setLoading(null)
            }
        } catch {
            setError('Something went wrong. Please try again or contact support.')
            setLoading(null)
        }
    }

    return (
        <>
            <Head title="Plans & Pricing — HostFlows" />

            {/* Redirect overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="text-center max-w-xs">
                        <div className="text-lg font-bold text-gray-900 mb-1">Taking you to secure checkout</div>
                        <div className="text-sm text-gray-400">You're being redirected to Stripe — the payment platform trusted by millions of businesses globally.</div>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-gray-400 border border-gray-100 rounded-xl px-5 py-3 bg-gray-50">
                        <span>🔒 256-bit SSL encryption</span>
                        <span>✓ Cancel anytime</span>
                        <span>✓ No hidden fees</span>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F8F9FB]">

                {/* Nav */}
                <div className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                        <Link href={route('host.dashboard')} className="font-bold text-gray-900 tracking-tight">HostFlows</Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/></svg>
                            Secured by Stripe
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-14">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/></svg>
                            Secure checkout · Cancel anytime
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Plans built for property hosts</h1>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Start free with your first property. Upgrade as you grow. No lock-in, no surprises — your plan updates the moment payment clears.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 text-center max-w-lg mx-auto">
                            {error}
                        </div>
                    )}

                    {/* Plan cards */}
                    <div className="grid gap-5 md:grid-cols-3 items-stretch">
                        {PLANS.map((plan) => {
                            const isCurrent = userPlan === plan.key

                            if (plan.highlight) {
                                // Featured card — dark
                                return (
                                    <div key={plan.key} className="relative rounded-2xl bg-gray-900 text-white flex flex-col shadow-xl ring-2 ring-indigo-500 -mt-2 md:-mt-4">
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow">
                                            Most popular
                                        </div>
                                        <div className="p-6 border-b border-white/10">
                                            <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-2">{plan.name}</div>
                                            <div className="text-4xl font-black mb-1">
                                                <span className="text-xl font-semibold text-white/60 mr-0.5">A$</span>{plan.price}
                                                <span className="text-sm font-medium text-white/50"> /mo</span>
                                            </div>
                                            <p className="text-sm text-white/60 mt-2">{plan.pitch}</p>
                                        </div>
                                        <ul className="p-6 flex-1 space-y-3">
                                            {plan.features.map(f => (
                                                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                                                    {f.ok
                                                        ? <svg className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                                                        : <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/></svg>
                                                    }
                                                    <span className={f.ok ? 'text-white/90' : 'text-white/30'}>{f.label}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="p-6 border-t border-white/10">
                                            {isCurrent ? (
                                                <div className="w-full text-center py-2.5 text-sm font-medium text-white/40 border border-white/10 rounded-xl">Current plan</div>
                                            ) : (
                                                <button onClick={() => handleUpgrade(plan.key)} disabled={!!loading}
                                                    className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition disabled:opacity-50">
                                                    {loading === plan.key ? 'Redirecting…' : `Get ${plan.name} — A$${plan.price}/mo`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            // Standard card
                            return (
                                <div key={plan.key} className="rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col">
                                    <div className="p-6 border-b border-gray-50">
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{plan.name}</div>
                                        <div className="text-4xl font-black text-gray-900 mb-1">
                                            {plan.price === 0
                                                ? <span>Free</span>
                                                : <><span className="text-xl font-semibold text-gray-400 mr-0.5">A$</span>{plan.price}<span className="text-sm font-medium text-gray-400"> /mo</span></>
                                            }
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">{plan.pitch}</p>
                                    </div>
                                    <ul className="p-6 flex-1 space-y-3">
                                        {plan.features.map(f => (
                                            <li key={f.label} className="flex items-start gap-2.5 text-sm">
                                                {f.ok ? <IconCheck /> : <IconX />}
                                                <span className={f.ok ? 'text-gray-700' : 'text-gray-300'}>{f.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="p-6 border-t border-gray-50">
                                        {isCurrent ? (
                                            <div className="w-full text-center py-2.5 text-sm font-medium text-gray-400 border border-gray-100 rounded-xl bg-gray-50">Current plan</div>
                                        ) : plan.key === 'free' ? (
                                            <div className="w-full text-center py-2.5 text-sm font-medium text-gray-400 border border-gray-100 rounded-xl bg-gray-50">Free forever</div>
                                        ) : (
                                            <button onClick={() => handleUpgrade(plan.key)} disabled={!!loading}
                                                className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm transition disabled:opacity-50">
                                                {loading === plan.key ? 'Redirecting…' : `Get ${plan.name} — A$${plan.price}/mo`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust strip */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/></svg>
                            256-bit SSL encryption
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                            Cancel any time — no questions asked
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                            Instant access after payment
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                            Payments processed by Stripe
                        </span>
                    </div>

                    {/* Testimonials */}
                    <div className="mt-14">
                        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Trusted by property hosts across Australia</p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {TESTIMONIALS.map(t => (
                                <div key={t.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.quote}"</p>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">{t.name}</div>
                                        <div className="text-[11px] text-gray-400">{t.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ strip */}
                    <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid sm:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</div>
                            <div className="text-gray-500 text-xs">Yes. Cancel from your billing page and you'll keep access until the end of your billing period. No lock-in.</div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 mb-1">Is my payment secure?</div>
                            <div className="text-gray-500 text-xs">All payments go through Stripe — PCI-DSS Level 1 certified. We never store card details.</div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 mb-1">What happens after I pay?</div>
                            <div className="text-gray-500 text-xs">Your plan upgrades instantly the moment payment clears. No waiting, no manual approval.</div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        Questions? <a href="mailto:support@hostflows.com.au" className="underline hover:text-gray-600">support@hostflows.com.au</a>
                    </p>
                </div>
            </div>
        </>
    )
}
