import { Head, useForm } from '@inertiajs/react';

export default function Checkout({ userPlan, limits, checkoutRoute }) {
    const { post, processing } = useForm({});
    const isPro = userPlan === 'pro';

    // Fire Stripe Checkout session via billing.checkout
    const handleUpgrade = () => {
        post(checkoutRoute);
    };

    return (
        <>
            <Head title="Upgrade to Pro" />

            <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-12">
                <div className="w-full max-w-4xl">
                    {/* Header / pitch */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Upgrade to Pro
                        </h1>

                        <p className="mt-2 text-gray-600 text-sm">
                            Unlock unlimited properties and active stays, add your own
                            branding to guest pages, and look like a professional
                            short-stay operator — not just “someone on Airbnb.”
                        </p>

                        {isPro && (
                            <div className="mt-4 inline-block rounded-full bg-green-100 text-green-700 text-xs font-medium px-3 py-1">
                                You’re already on Pro 🎉
                            </div>
                        )}
                    </div>

                    {/* Pricing cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Free plan card */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
                            <div className="p-6 border-b border-gray-100">
                                <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wide">
                                    Free Plan
                                </div>

                                <div className="mt-2 text-3xl font-bold text-gray-900">
                                    $0
                                    <span className="text-base font-medium text-gray-500">
                                        {' '}
                                        /month
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    Perfect to get started with your first property.
                                </p>
                            </div>

                            <ul className="p-6 flex-1 space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>Up to {limits.free.max_properties} property</span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        Personalised guest welcome page
                                        {' '}
                                        <span className="text-gray-500 text-[11px]">
                                            (/p/&lt;slug&gt;)
                                        </span>
                                        {' '}
                                        for each stay
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        QR code for each stay (print it for check-in)
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        Guest access to Wi-Fi, smart lock code, house rules
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        Visit tracking (total views &amp; last 7 days)
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    <span className="line-through decoration-red-500">
                                        Custom brand / concierge header
                                    </span>
                                </li>
                            </ul>

                            <div className="p-6 border-t border-gray-100">
                                <button
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-400"
                                >
                                    Current
                                </button>
                            </div>
                        </div>

                        {/* Pro plan card */}
                        <div className="rounded-2xl border border-indigo-500 bg-white shadow-lg ring-1 ring-indigo-500/20 flex flex-col relative">
                            <div className="absolute -top-3 right-4">
                                <div className="rounded-full bg-indigo-600 text-white text-[10px] font-semibold px-2 py-1 shadow-md">
                                    Most popular
                                </div>
                            </div>

                            <div className="p-6 border-b border-gray-100">
                                <div className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wide">
                                    Pro Plan
                                </div>

                                <div className="mt-2 text-3xl font-bold text-gray-900">
                                    ${limits.pro.price}
                                    <span className="text-base font-medium text-gray-500">
                                        {' '}
                                        /month
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    For serious hosts who want concierge-grade presentation
                                    and unlimited active stays.
                                </p>
                            </div>

                            <ul className="p-6 flex-1 space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>
                                        {limits.pro.max_properties} properties / stays
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>
                                        Full branding: your logo + your “text us anytime”
                                        concierge header in the guest’s hero section
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>
                                        WhatsApp share links + tap-to-call host button
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>
                                        Live visit analytics per stay
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>
                                        You look like a boutique property manager, not
                                        “some listing”
                                    </span>
                                </li>
                            </ul>

                            <div className="p-6 border-t border-gray-100">
                                {isPro ? (
                                    <button
                                        disabled
                                        className="w-full cursor-not-allowed rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:opacity-60"
                                    >
                                        You’re on Pro ✔
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={processing}
                                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        Upgrade to Pro
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reassurance / proof */}
                    <div className="mt-10 text-center text-xs text-gray-500 leading-relaxed max-w-xl mx-auto">
                        <p>
                            Guests open your link on their phone at the door. They see
                            your logo, check-in steps, Wi-Fi, and house rules all in one
                            place — no more “can you resend the code?” texts at 11pm.
                        </p>

                        <p className="mt-4">
                            Cancel any time. Your plan updates automatically right after
                            checkout.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
