import React from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";

function Check({ color = "indigo" }) {
    return (
        <svg className={`w-4 h-4 text-${color}-500 flex-shrink-0`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
    );
}

function Cross() {
    return (
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
    );
}

const PLANS = [
    {
        key: "free",
        name: "Starter",
        price: 0,
        pitch: "Get started with your first property at no cost.",
        color: "gray",
        features: [
            { label: "1 property", included: true },
            { label: "1 active stay", included: true },
            { label: "Guest welcome page (/p/<slug>)", included: true },
            { label: "QR code per stay", included: true },
            { label: "Wi-Fi, lock code, house rules", included: true },
            { label: "Custom branding", included: false },
            { label: "Analytics dashboard", included: false },
            { label: "Maintenance tracking", included: false },
            { label: "Guest auto-email on check-in", included: false },
        ],
    },
    {
        key: "host",
        name: "Host",
        price: 19,
        pitch: "For serious hosts who want branding and unlimited stays.",
        badge: "Most popular",
        color: "indigo",
        features: [
            { label: "Up to 5 properties", included: true },
            { label: "Unlimited active stays", included: true },
            { label: "Guest welcome page (/p/<slug>)", included: true },
            { label: "QR code per stay", included: true },
            { label: "Wi-Fi, lock code, house rules", included: true },
            { label: "Custom branding (logo + header)", included: true },
            { label: "Analytics dashboard — basic", included: true },
            { label: "Maintenance tracking", included: false },
            { label: "Guest auto-email on check-in", included: false },
        ],
    },
    {
        key: "pro",
        name: "Pro",
        price: 49,
        pitch: "For property managers and agencies running multiple sites.",
        color: "emerald",
        features: [
            { label: "Unlimited properties", included: true },
            { label: "Unlimited active stays", included: true },
            { label: "Guest welcome page (/p/<slug>)", included: true },
            { label: "QR code per stay", included: true },
            { label: "Wi-Fi, lock code, house rules", included: true },
            { label: "Custom branding (logo + header)", included: true },
            { label: "Analytics dashboard — full", included: true },
            { label: "Maintenance tracking", included: true },
            { label: "Guest auto-email on check-in", included: true },
        ],
    },
];

const ringColor = { indigo: "ring-indigo-500 border-indigo-400", emerald: "ring-emerald-500 border-emerald-400", gray: "border-gray-200" };
const badgeColor = { indigo: "bg-indigo-600", emerald: "bg-emerald-600" };
const btnColor = {
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
};

export default function Checkout({ userPlan, checkoutRoute }) {
    const [loading, setLoading] = React.useState(null)
    const [error, setError] = React.useState(null)

    const handleUpgrade = async (planKey, planName) => {
        setLoading(planKey)
        setError(null)
        try {
            const res = await axios.post(checkoutRoute, { plan: planKey });
            if (res?.data?.url) {
                window.location.href = res.data.url;
            } else {
                setError('Could not start checkout. Please try again.')
                setLoading(null)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(null)
        }
    };

    return (
        <>
            <Head title="HostFlows — Choose Your Plan" />

            {/* Redirect overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="text-center">
                        <div className="font-semibold text-gray-900">Redirecting to secure checkout…</div>
                        <div className="text-sm text-gray-400 mt-1">You'll be taken to Stripe — the world's most trusted payment platform.</div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">🔒 256-bit SSL</span>
                        <span className="flex items-center gap-1">✓ Cancel anytime</span>
                        <span className="flex items-center gap-1">✓ No hidden fees</span>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-14">
                <div className="w-full max-w-5xl">

                    {/* Trust bar */}
                    <div className="flex items-center justify-center gap-6 mb-8 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">🔒 Secure checkout via Stripe</span>
                        <span className="flex items-center gap-1.5">✓ Cancel anytime</span>
                        <span className="flex items-center gap-1.5">✓ No lock-in contracts</span>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h1>
                        <p className="mt-2 text-gray-500 text-sm max-w-lg mx-auto">
                            Start free, upgrade when you're ready. Cancel any time — your plan updates instantly after checkout.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 text-center">{error}</div>
                    )}

                    <div className="grid gap-6 md:grid-cols-3">
                        {PLANS.map((plan) => {
                            const isCurrent = userPlan === plan.key;
                            const ring = ringColor[plan.color];

                            return (
                                <div
                                    key={plan.key}
                                    className={`relative rounded-2xl bg-white border flex flex-col shadow-sm ${ring} ${plan.badge ? "ring-2" : ""}`}
                                >
                                    {plan.badge && (
                                        <div className={`absolute -top-3 right-4 rounded-full ${badgeColor[plan.color]} text-white text-[10px] font-semibold px-3 py-1 shadow`}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div className="p-6 border-b border-gray-100">
                                        <div className={`text-[11px] font-semibold uppercase tracking-wide text-${plan.color === "gray" ? "gray-400" : plan.color + "-600"}`}>
                                            {plan.name}
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            ${plan.price}
                                            <span className="text-base font-medium text-gray-400"> /mo</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">{plan.pitch}</p>
                                    </div>

                                    <ul className="p-6 flex-1 space-y-2.5">
                                        {plan.features.map((f) => (
                                            <li key={f.label} className="flex items-start gap-2 text-sm text-gray-700">
                                                {f.included ? <Check color={plan.color === "gray" ? "gray" : plan.color} /> : <Cross />}
                                                <span className={f.included ? "" : "text-gray-400"}>{f.label}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="p-6 border-t border-gray-100">
                                        {userPlan === plan.key ? (
                                            <button disabled className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-400">
                                                Current plan
                                            </button>
                                        ) : plan.key === "free" ? (
                                            <button disabled className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-400">
                                                Free forever
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpgrade(plan.key, plan.name)}
                                                disabled={!!loading}
                                                className={`w-full rounded-lg py-2.5 text-sm font-semibold shadow transition-colors disabled:opacity-60 ${btnColor[plan.color]}`}
                                            >
                                                {loading === plan.key ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-10 text-center space-y-2">
                        <p className="text-xs text-gray-400">Payments processed securely by <span className="font-semibold text-gray-500">Stripe</span> — used by millions of businesses worldwide.</p>
                        <p className="text-xs text-gray-400">Questions? Email <a href="mailto:support@hostflows.com.au" className="underline hover:text-gray-600">support@hostflows.com.au</a></p>
                    </div>
                </div>
            </div>
        </>
    );
}
