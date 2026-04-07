import React from "react";
import { usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";

function initials(name) {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    const m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (s < 60) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return "yesterday";
    return `${d}d ago`;
}

export default function AdminDashboard() {
    const { users, totals } = usePage().props;
    const [q, setQ] = React.useState("");
    const [planFilter, setPlanFilter] = React.useState("");
    const [sort, setSort] = React.useState("newest");
    const [confirmDelete, setConfirmDelete] = React.useState(null);

    const filtered = React.useMemo(() => {
        let list = [...users].filter(u => {
            const matchQ = !q || (u.name + u.email).toLowerCase().includes(q.toLowerCase());
            const matchP = !planFilter || u.plan === planFilter;
            return matchQ && matchP;
        });
        if (sort === "newest") list.sort((a, b) => new Date(b.joined) - new Date(a.joined));
        else if (sort === "oldest") list.sort((a, b) => new Date(a.joined) - new Date(b.joined));
        else list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
    }, [users, q, planFilter, sort]);

  const togglePlan = (user) => {
    router.post(route("admin.users.plan", user.id), {}, {
        preserveScroll: true,
        preserveState: false,
    });
};

    const deleteUser = (user) => {
        router.delete(route("admin.users.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(null),
        });
    };

    return (
        <Shell title="Admin Dashboard">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="text-lg font-semibold">Admin Dashboard</div>
                    <div className="text-sm text-gray-500">Manage customers and subscriptions</div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total users", value: totals.total },
                    { label: "Pro subscribers", value: totals.pro, green: true },
                    { label: "Free plan", value: totals.free },
                    { label: "MRR (est.)", value: `$${totals.mrr.toLocaleString()}`, green: true },
                ].map((k) => (
                    <div key={k.label} className="rounded-xl border bg-white p-4">
                        <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                        <div className={`text-2xl font-semibold ${k.green ? "text-emerald-600" : ""}`}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="rounded-2xl border bg-white p-4 mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        className="border rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-[200px] text-sm"
                        placeholder="Search by name or email…"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                    <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
                        <option value="">All plans</option>
                        <option value="pro">Pro</option>
                        <option value="free">Free</option>
                    </select>
                    <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="name">A–Z</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            {["User", "Plan", "Properties", "Stays", "Joined", "Last updated", "Actions"].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                            {initials(u.name)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                        u.plan === "pro"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}>
                                        {u.plan === "pro" ? "PRO" : "FREE"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">{u.properties_count}</td>
                                <td className="px-4 py-3 text-center">{u.stays_count}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.joined)}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(u.updated_at)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => togglePlan(u)}
                                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                u.plan === "free"
                                                    ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                                    : "text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            {u.plan === "free" ? "→ Pro" : "→ Free"}
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(u)}
                                            className="text-xs px-2 py-1 rounded border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-2 text-xs text-gray-400 border-t">{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</div>
            </div>

            {/* Delete confirm modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-semibold">Delete user?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            This will permanently delete <strong>{confirmDelete.name}</strong> and all their data.
                        </p>
                        <div className="mt-4 flex gap-3 justify-end">
                            <button className="px-3 py-2 rounded-lg border hover:bg-gray-100" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700" onClick={() => deleteUser(confirmDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Shell>
    );
}