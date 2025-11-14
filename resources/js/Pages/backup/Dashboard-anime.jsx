import React from "react";
import { motion } from "framer-motion";
import { Link, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";
import StatCard from "@/Components/StatCard";
import ShareStayModal from "@/Components/ShareStayModal";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "--");

function stayStatus(pkg) {
  if (pkg?.status === "cancelled") return { label: "Cancelled", tone: "red" };
  const hasDates = pkg?.check_in_date && pkg?.check_out_date;
  if (!hasDates) return { label: "Draft", tone: "amber" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(pkg.check_in_date + "T00:00:00");
  const end = new Date(pkg.check_out_date + "T00:00:00");

  if (today >= start && today <= end) return { label: "Ongoing", tone: "emerald" };
  if (today < start) {
    const daysUntil = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return { label: daysUntil === 0 ? "Today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`, tone: "sky" };
  }
  return { label: "Ended", tone: "gray" };
}

function toneClass(tone) {
  return (
    {
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      sky: "bg-sky-100 text-sky-700 border-sky-200",
      amber: "bg-amber-100 text-amber-700 border-amber-200",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
      red: "bg-red-100 text-red-700 border-red-200",
    }[tone] || "bg-gray-100 text-gray-700 border-gray-300"
  );
}

export default function Dashboard() {
  const { properties, totals, filters, userMeta, limits, recentlyUpgraded } = usePage().props;
  const firstName = userMeta?.first_name || "Host";
  const isFreePlan = userMeta?.plan === "free";
  const blockedOnProperty = limits && !limits.canCreateProperty;
  const blockedOnStay = limits && !limits.canCreateStay;
  const showUpgradeBanner = isFreePlan && (blockedOnProperty || blockedOnStay);
  const items = properties.data;

  const [sharePkg, setSharePkg] = React.useState(null);
  const [sharePropertyTitle, setSharePropertyTitle] = React.useState("");
  const [q, setQ] = React.useState(filters.q || "");
  const [sort, setSort] = React.useState(filters.sort || "new");
  const [perPage, setPerPage] = React.useState(filters.perPage || 9);
  const [confirmId, setConfirmId] = React.useState(null);
  const [confirmStay, setConfirmStay] = React.useState(null);

  const submitFilters = (page = 1) => {
    router.get(route("host.dashboard"), { q, sort, perPage, page }, { preserveState: true, replace: true });
  };

  const doDelete = (id) => {
    router.delete(route("properties.destroy", id), { preserveScroll: true, onSuccess: () => setConfirmId(null) });
  };

  const deleteStay = (stayId) => {
    router.delete(route("packages.destroy", stayId), { preserveScroll: true, onSuccess: () => setConfirmStay(null) });
  };

  return (
    <Shell
      title="Host Dashboard"
      right={
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#111" }}
          whileTap={{ scale: 0.95 }}
          disabled={!limits?.canCreateProperty}
          onClick={() => limits?.canCreateProperty && router.visit(route("properties.create"))}
          className={`${!limits?.canCreateProperty ? "opacity-50 cursor-not-allowed" : ""} px-5 py-2 rounded-xl bg-black text-white font-medium shadow-lg hover:shadow-2xl transition-all`}
        >
          + Add Property
        </motion.button>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {recentlyUpgraded && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-md"
          >
            <h3 className="font-semibold text-emerald-700 text-lg">Welcome to Pro, {firstName}! 🎉</h3>
            <p className="text-emerald-600 text-sm">You can now enjoy unlimited properties, custom branding, and full analytics.</p>
          </motion.div>
        )}

        {showUpgradeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-yellow-400 bg-gradient-to-r from-yellow-50 to-white p-5 shadow-md"
          >
            <h3 className="font-semibold text-yellow-700 text-lg">Free plan limit reached ⚠️</h3>
            <p className="text-yellow-600 text-sm mb-3">Upgrade to Pro for unlimited properties, stays, and branding tools.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.visit(route("checkout.show"))} className="rounded-lg bg-yellow-600 text-white px-4 py-2 font-medium hover:bg-yellow-700 transition-all">
              Upgrade to Pro
            </motion.button>
          </motion.div>
        )}

        <motion.div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              className="border rounded-lg p-2 flex-1 focus:ring-2 focus:ring-black/20"
              placeholder="Search properties…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitFilters()}
            />
            <select className="border rounded-lg p-2" value={sort} onChange={(e) => { setSort(e.target.value); submitFilters(); }}>
              <option value="new">Newest</option>
              <option value="az">A–Z</option>
            </select>
            <select className="border rounded-lg p-2" value={perPage} onChange={(e) => { setPerPage(e.target.value); submitFilters(); }}>
              <option value="6">6 / page</option>
              <option value="9">9 / page</option>
              <option value="12">12 / page</option>
            </select>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => submitFilters()} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 font-medium transition-all">
              Apply
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Properties" value={totals.properties} />
          <StatCard label="Packages" value={totals.packages} />
          <StatCard label="Total Visits" value={totals.visits} />
          <StatCard label="Last 7 days" value={totals.visits7d} />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border bg-white p-5 shadow-md hover:shadow-2xl transition-all flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate text-lg">{p.title}</h3>
                  {p.address && <p className="text-sm text-gray-500 truncate">{p.address}</p>}
                </div>
                {p.welcome_packages?.[0]?.qr_code_path && (
                  <a href={`/storage/${p.welcome_packages[0].qr_code_path}`} target="_blank" title="Open QR">
                    <motion.img whileHover={{ scale: 1.1 }} src={`/storage/${p.welcome_packages[0].qr_code_path}`} alt="QR" className="w-16 h-16 object-contain border rounded-md bg-white shadow-sm" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <Link href={route("properties.edit", p.id)} className="px-3 py-1 rounded border text-sm hover:bg-gray-50 transition-all">Edit</Link>
                <button disabled={!limits?.canCreateStay} onClick={() => limits?.canCreateStay && router.visit(route("packages.create", p.id))} className={`${!limits?.canCreateStay ? "opacity-50 cursor-not-allowed" : ""} px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-all`}>
                  + New Stay
                </button>
                <button className="px-3 py-1 rounded border text-sm text-red-600 hover:bg-red-50 transition-all" onClick={() => setConfirmId(p.id)}>Delete</button>
              </div>

              {p.welcome_packages?.length ? (
                <div className="space-y-3 mt-2">
                  {p.welcome_packages.map((pkg) => {
                    const s = stayStatus(pkg);
                    return (
                      <motion.div key={pkg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative border rounded-xl p-3 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              <span>{pkg.guest_first_name || "Guest"}{pkg.guest_count ? ` (${pkg.guest_count})` : ""}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${toneClass(s.tone)}`}>{s.label}</span>
                            </div>
                            <p className="text-xs text-gray-600">{fmtDate(pkg.check_in_date)} → {fmtDate(pkg.check_out_date)}</p>
                          </div>
                          <div className="flex gap-1">
                            <a href={`/p/${pkg.slug}`} target="_blank" className="text-xs px-2 py-1 border rounded hover:bg-gray-200 transition-all">Open</a>
                            <a href={route("packages.edit", pkg.slug)} className="text-xs px-2 py-1 border rounded hover:bg-gray-200 transition-all">Edit</a>
                          </div>
                        </div>
                        {pkg.qr_code_path && (
                          <motion.div className="mt-2" whileHover={{ scale: 1.02 }}>
                            <button className="text-xs px-2 py-1 border rounded bg-black text-white hover:bg-gray-800 transition-all" onClick={() => { setSharePkg(pkg); setSharePropertyTitle(p.title); }}>Share / QR / WhatsApp</button>
                          </motion.div>
                        )}
                        <button className="absolute bottom-2 right-2 text-[11px] px-2 py-1 border rounded text-red-600 bg-white hover:bg-red-50 transition-all" onClick={() => setConfirmStay(pkg)}>Delete</button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No stays yet.</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {sharePkg && <ShareStayModal pkg={sharePkg} propertyTitle={sharePropertyTitle} onClose={() => setSharePkg(null)} />}
    </Shell>
  );
}
