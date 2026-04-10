import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";

function KpiCard({ label, value, sub }) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    );
}

function BarRow({ label, value, max, href }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="w-36 shrink-0 text-xs text-gray-600 truncate" title={label}>{label}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="w-10 text-right text-xs font-medium text-gray-700">{value}</div>
            {href && (
                <Link href={href} className="text-xs text-indigo-500 hover:underline shrink-0">View</Link>
            )}
        </div>
    );
}

function Sparkline({ data }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1.5 h-20">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full bg-indigo-400 rounded-t"
                        style={{ height: `${Math.max(4, Math.round((d.count / max) * 72))}px` }}
                        title={`${d.count} visits`}
                    />
                    <div className="text-[10px] text-gray-400">{d.date}</div>
                </div>
            ))}
        </div>
    );
}

function OccupancyRow({ property, pct, bookedDays, stays }) {
    return (
        <div className="py-2">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 truncate">{property}</span>
                <span className="text-gray-500 shrink-0 ml-2">{pct}% · {stays} stay{stays !== 1 ? "s" : ""}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-2 rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{bookedDays} booked days in 180-day window</div>
        </div>
    );
}

function RevenueTable({ data }) {
    if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">No revenue data yet. Add pricing to your stays to track revenue.</p>;
    const maxRev = Math.max(...data.map(d => d.revenue), 1);
    return (
        <div className="space-y-2">
            {data.map((row) => (
                <div key={row.month} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-gray-500 shrink-0">{row.month}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round((row.revenue / maxRev) * 100)}%` }} />
                    </div>
                    <div className="w-20 text-right text-xs font-medium text-gray-700">${row.revenue.toLocaleString("en-AU", { minimumFractionDigits: 0 })}</div>
                    <div className="w-12 text-right text-xs text-gray-400">{row.stays} stays</div>
                </div>
            ))}
        </div>
    );
}

export default function Analytics() {
    const { userPlan, isPro, kpis, visitsByStay, visits7d, occupancy, revenueByMonth } = usePage().props;

    const maxVisits = Math.max(...(visitsByStay?.map(v => v.visits) ?? [1]), 1);

    return (
        <Shell title="Analytics">
            <Head title="Analytics — HostFlows" />

            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="text-lg font-semibold">Analytics</div>
                    <div className="text-sm text-gray-500">
                        {isPro ? "Full analytics — Pro plan" : "Basic analytics — Host plan"}
                    </div>
                </div>
                {!isPro && (
                    <Link href={route("checkout.show")} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                        Upgrade to Pro for full analytics
                    </Link>
                )}
            </div>

            {/* KPI row */}
            <div className={`grid grid-cols-2 ${isPro ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-6`}>
                <KpiCard label="Total guest visits" value={kpis.totalVisits.toLocaleString()} />
                <KpiCard label="Visits last 7 days" value={kpis.visits7d.toLocaleString()} />
                <KpiCard label="Total stays" value={kpis.totalStays.toLocaleString()} />
                {isPro && (
                    <KpiCard
                        label="Total revenue"
                        value={kpis.totalRevenue != null ? `$${Number(kpis.totalRevenue).toLocaleString("en-AU")}` : "—"}
                        sub="From stays with pricing"
                    />
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Visits last 7 days sparkline */}
                <div className="rounded-2xl border bg-white p-5">
                    <div className="text-sm font-medium mb-4">Visits — last 7 days</div>
                    <Sparkline data={visits7d} />
                </div>

                {/* Occupancy */}
                <div className="rounded-2xl border bg-white p-5">
                    <div className="text-sm font-medium mb-3">Occupancy rate (180-day window)</div>
                    {occupancy?.length ? (
                        <div className="divide-y">
                            {occupancy.map((o) => (
                                <OccupancyRow key={o.property} {...o} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-4 text-center">No properties yet.</p>
                    )}
                </div>

                {/* Top stays by visits */}
                <div className="rounded-2xl border bg-white p-5">
                    <div className="text-sm font-medium mb-3">Top stays by visits</div>
                    {visitsByStay?.length ? (
                        <div className="divide-y">
                            {visitsByStay.map((v) => (
                                <BarRow
                                    key={v.slug}
                                    label={v.label}
                                    value={v.visits}
                                    max={maxVisits}
                                    href={route("packages.edit", v.slug)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-4 text-center">No stays with visits yet. Share your guest links to start tracking.</p>
                    )}
                </div>

                {/* Revenue by month (Pro only) */}
                {isPro ? (
                    <div className="rounded-2xl border bg-white p-5">
                        <div className="text-sm font-medium mb-3">Revenue by month</div>
                        <RevenueTable data={revenueByMonth} />
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-white p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
                        <div className="text-2xl">📊</div>
                        <div className="text-sm font-medium text-gray-700">Revenue tracking</div>
                        <div className="text-xs text-gray-400">Monthly revenue trends are available on the Pro plan.</div>
                        <Link href={route("checkout.show")} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 mt-1">
                            Upgrade to Pro
                        </Link>
                    </div>
                )}
            </div>
        </Shell>
    );
}
