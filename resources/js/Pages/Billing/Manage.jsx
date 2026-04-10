import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";

const PLAN_META = {
    free: {
        label: "Starter",
        price: "$0 / mo",
        badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
        features: [
            "1 property",
            "1 active stay",
            "Guest welcome page (/p/<slug>)",
            "QR code per stay",
            "Wi-Fi, lock code, house rules",
        ],
    },
    host: {
        label: "Host",
        price: "$19 / mo",
        badgeClass: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        features: [
            "Up to 5 properties",
            "Unlimited active stays",
            "Guest welcome page (/p/<slug>)",
            "QR code per stay",
            "Wi-Fi, lock code, house rules",
            "Custom branding (logo + header)",
            "Analytics dashboard — basic",
        ],
    },
    pro: {
        label: "Pro",
        price: "$49 / mo",
        badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        features: [
            "Unlimited properties",
            "Unlimited active stays",
            "Guest welcome page (/p/<slug>)",
            "QR code per stay",
            "Wi-Fi, lock code, house rules",
            "Custom branding (logo + header)",
            "Analytics dashboard — full",
            "Maintenance tracking",
            "Guest auto-email on check-in",
        ],
    },
};

function CheckIcon() {
    return (
        <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function CreditCardIcon() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    );
}

export default function Manage({ plan, hasStripeCustomer, checkoutRoute, portalRoute }) {
    const meta = PLAN_META[plan] ?? PLAN_META.free;
    const isPaid = plan === "host" || plan === "pro";

    function handlePortal() {
        router.post(portalRoute);
    }

    return (
        <Shell title="Billing">
            <Head title="Billing — HostFlows" />

            <div className="max-w-2xl mx-auto py-10 px-4">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your plan, view invoices, and update payment details.
                    </p>
                </div>

                {/* Current plan card */}
                <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                Current plan
                            </p>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                                >
                                    {meta.label}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    {meta.price}
                                </span>
                            </div>
                        </div>

                        {!isPaid && (
                            <Link
                                href={checkoutRoute}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                            >
                                Upgrade plan
                            </Link>
                        )}
                    </div>

                    {/* Features list */}
                    <div className="px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                            What's included
                        </p>
                        <ul className="space-y-2">
                            {meta.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckIcon />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Stripe Portal section */}
                <div className="mt-6 rounded-2xl bg-white border shadow-sm px-6 py-5">
                    {hasStripeCustomer ? (
                        <>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Subscription management
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Cancel your subscription, download invoices, or update your
                                payment method — all from Stripe's secure portal.
                            </p>

                            <button
                                onClick={handlePortal}
                                className="inline-flex items-center gap-2 rounded-lg bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                <CreditCardIcon />
                                Manage billing, invoices &amp; cancellation
                            </button>

                            <p className="mt-3 text-xs text-gray-400">
                                You'll be taken to Stripe's secure portal to manage your
                                subscription.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                No active subscription
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                You're on the free plan. Upgrade to unlock more properties,
                                branding, analytics, and maintenance tracking.
                            </p>

                            <Link
                                href={checkoutRoute}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 transition-colors"
                            >
                                View upgrade options
                            </Link>
                        </>
                    )}
                </div>

                {/* Back link */}
                <div className="mt-8">
                    <Link
                        href={route("host.dashboard")}
                        className="text-sm text-gray-500 hover:text-gray-800 inline-flex items-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </Shell>
    );
}
