import React from "react";
import axios from "axios";
import { Link, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";
import StatCard from "@/Components/StatCard";
import ShareStayModal from "@/Components/ShareStayModal";

// date formatter
const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString() : "--";

// status pill logic for each stay
function stayStatus(pkg) {
  if (pkg?.status === "cancelled") {
    return { label: "Cancelled stay", tone: "red" };
  }

  const hasDates = pkg?.check_in_date && pkg?.check_out_date;
  if (!hasDates) {
    return { label: "Draft", tone: "amber" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(pkg.check_in_date + "T00:00:00");
  const end = new Date(pkg.check_out_date + "T00:00:00");

  if (today >= start && today <= end) {
    return { label: "Ongoing", tone: "emerald" };
  }

  if (today < start) {
    const msDiff = start - today;
    const daysUntil = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    const text =
      daysUntil === 0 ? "Today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
    return { label: text, tone: "sky" };
  }

  return { label: "Ended", tone: "gray" };
}

function toneClass(tone) {
  return (
    {
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
      sky: "bg-sky-50 text-sky-700 border-sky-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      gray: "bg-gray-50 text-gray-700 border-gray-300",
      red: "bg-red-50 text-red-700 border-red-200",
    }[tone] || "bg-gray-50 text-gray-700 border-gray-300"
  );
}

const I = {
  edit: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M5 18.08V21h2.92l8.57-8.57l-2.92-2.92zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
      />
    </svg>
  ),
  del: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3.46-9h1.5v8h-1.5zm4 0h1.5v8h-1.5zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
      />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5m7-3h2v2h-2zm2 4h-2v2h2zm1-6h3a5 5 0 1 1 0 10h-3v-2h3a3 3 0 1 0 0-6h-3z"
      />
    </svg>
  ),
};

function Paginator({ links }) {
  if (!links?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-8">
      {links.map((l, i) => (
        <button
          key={i}
          disabled={!l.url}
          onClick={() =>
            l.url && router.visit(l.url, { preserveState: true, replace: true })
          }
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            !l.url ? "opacity-50 cursor-not-allowed" : ""
          } ${l.active ? "bg-black text-white border-black" : ""}`}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const {
    properties,
    totals,
    filters,
    userMeta,
    limits,
    recentlyUpgraded,
  } = usePage().props;

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
    router.get(
      route("host.dashboard"),
      { q, sort, perPage, page },
      { preserveState: true, replace: true }
    );
  };

  const doDelete = (id) => {
    router.delete(route("properties.destroy", id), {
      preserveScroll: true,
      onSuccess: () => setConfirmId(null),
    });
  };

  const deleteStay = (stayId) => {
    router.delete(route("packages.destroy", stayId), {
      preserveScroll: true,
      onSuccess: () => {
        setConfirmStay(null);
      },
    });
  };

  return (
    <Shell
      title="Host Dashboard"
      right={
        <button
          disabled={!limits?.canCreateProperty}
          onClick={() => {
            if (!limits?.canCreateProperty) return;
            router.visit(route("properties.create"));
          }}
          className={
            (!limits?.canCreateProperty
              ? "opacity-50 cursor-not-allowed "
              : "hover:bg-gray-800 ") +
            "px-3 py-2 rounded-lg bg-black text-white font-medium transition-colors"
          }
        >
          Add Property
        </button>
      }
    >
      {/* banners */}
      {recentlyUpgraded ? (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-50 p-4 mb-4 text-sm">
          <div className="font-semibold text-emerald-800 mb-1">
            Thanks, {firstName}! You’re on Pro ✅
          </div>
          <div className="text-emerald-700">
            You can now create unlimited properties and stays, add your own
            branding to guest pages, and see visit analytics for every stay.
          </div>
        </div>
      ) : showUpgradeBanner ? (
        <div className="rounded-2xl border border-yellow-400 bg-yellow-50 p-4 mb-4 text-sm">
          <div className="font-semibold text-yellow-800 mb-1">
            You’ve hit the Free plan limit.
          </div>
          <div className="text-yellow-700 mb-3">
            Upgrade to Pro to add unlimited properties and active stays, plus
            unlock custom branding for your guest pages.
          </div>

          <button
            onClick={() => {
              router.visit(route("checkout.show"));
            }}
            className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-white font-medium hover:bg-yellow-700 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      ) : null}

      {/* Filters + KPI row */}
      <div className="rounded-2xl border bg-white p-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* left: filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center pt-5">
            <input
              className="border rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-[220px]"
              placeholder="Search properties…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitFilters()}
            />

            <select
  className="border rounded-lg px-3 py-2 pr-8 bg-white text-sm leading-none
             focus:outline-none focus:ring-2 focus:ring-black/10 appearance-none"
  value={sort}
  onChange={(e) => {
    setSort(e.target.value);
    submitFilters();
  }}
>
  <option value="new">Newest</option>
  <option value="az">A–Z</option>
</select>

<select
  className="border rounded-lg px-3 py-2 pr-8 bg-white text-sm leading-none
             focus:outline-none focus:ring-2 focus:ring-black/10 appearance-none"
  value={perPage}
  onChange={(e) => {
    setPerPage(e.target.value);
    submitFilters();
  }}
>
  <option value="6">6 / page</option>
  <option value="9">9 / page</option>
  <option value="12">12 / page</option>
  <option value="18">18 / page</option>
</select>


            <button
              onClick={() => submitFilters()}
              className="px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-100 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* right: KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto gap-3">
            <StatCard label="PROPERTIES" value={totals.properties} />
            <StatCard label="PACKAGES" value={totals.packages} />
            <StatCard label="TOTAL VISITS" value={totals.visits} />
            <StatCard label="LAST 7 DAYS" value={totals.visits7d} />
          </div>
        </div>
      </div>

      {/* Properties grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-white p-5 flex flex-col gap-4 shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-gray-800 text-[15px] leading-tight truncate">
                  {p.title}
                </div>
                {p.address && (
                  <div className="text-sm text-gray-600 truncate">
                    {p.address}
                  </div>
                )}
              </div>

              {p.welcome_packages?.length > 0 &&
                p.welcome_packages[0]?.qr_code_path && (
                  <a
                    href={`/storage/${p.welcome_packages[0].qr_code_path}`}
                    target="_blank"
                    title="Open QR"
                  >
                    <img
                      src={`/storage/${p.welcome_packages[0].qr_code_path}`}
                      alt="QR"
                      className="w-16 h-16 object-contain border rounded-md bg-white"
                      loading="lazy"
                    />
                  </a>
                )}
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <button
                disabled={!limits?.canCreateStay}
                onClick={() => {
                  if (!limits?.canCreateStay) return;
                  router.visit(route("packages.create", p.id));
                }}
                className={
                  (!limits?.canCreateStay
                    ? "opacity-50 cursor-not-allowed "
                    : "hover:bg-emerald-700 ") +
                  "px-3 py-1 rounded-md bg-emerald-600 text-white text-sm font-medium flex items-center gap-1 transition-colors"
                }
              >
                + New Stay
              </button>

              <Link
                href={route("properties.edit", p.id)}
                className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
              >
                {I.edit}
                <span>Edit</span>
              </Link>

              <button
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                onClick={() => setConfirmId(p.id)}
              >
                {I.del}
                <span>Delete</span>
              </button>
            </div>

            {/* Stays */}
            {p.welcome_packages?.length ? (
              <div className="space-y-3 mt-2">
                {[...p.welcome_packages]
                  .sort((a, b) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    function bucket(pkg) {
                      const hasDates =
                        pkg.check_in_date && pkg.check_out_date;

                      const start = hasDates
                        ? new Date(pkg.check_in_date + "T00:00:00")
                        : null;
                      const end = hasDates
                        ? new Date(pkg.check_out_date + "T00:00:00")
                        : null;

                      if (hasDates && today >= start && today <= end) {
                        return { grp: 0, key: 0 };
                      }

                      if (hasDates && today < start) {
                        const daysUntil = Math.ceil(
                          (start - today) / (1000 * 60 * 60 * 24)
                        );
                        return { grp: 1, key: daysUntil };
                      }

                      if (pkg.status === "cancelled") {
                        return { grp: 3, key: 9999 };
                      }

                      if (hasDates && today > end) {
                        const daysAgo = Math.ceil(
                          (today - end) / (1000 * 60 * 60 * 24)
                        );
                        return { grp: 2, key: daysAgo };
                      }

                      return { grp: 4, key: 9999 };
                    }

                    const A = bucket(a);
                    const B = bucket(b);

                    if (A.grp !== B.grp) return A.grp - B.grp;
                    return A.key - B.key;
                  })
                  .map((pkg) => {
                    const s = stayStatus(pkg);
                    return (
                      <div
                        key={pkg.id}
                        className="border rounded-lg p-3 bg-gray-50 text-sm flex flex-col gap-3"
                      >
                        {/* row 1 */}
                        <div className="flex flex-wrap justify-between gap-3">
                          <div className="min-w-[50%]">
                            <div className="flex flex-wrap items-center gap-2 font-medium text-gray-800">
                              <span>
                                {pkg.guest_first_name || "Guest"}
                                {pkg.guest_count
                                  ? ` (${pkg.guest_count})`
                                  : ""}
                              </span>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${toneClass(
                                  s.tone
                                )}`}
                              >
                                {s.label}
                              </span>
                            </div>

                            <div className="text-xs text-gray-600 leading-relaxed">
                              {fmtDate(pkg.check_in_date)} →{" "}
                              {fmtDate(pkg.check_out_date)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <a
                              href={`/p/${pkg.slug}`}
                              target="_blank"
                              className="px-2 py-1 rounded border bg-white hover:bg-gray-100 flex items-center gap-1 text-gray-700 transition-colors"
                            >
                              {I.link}
                              <span>Open</span>
                            </a>

                            <a
                              href={route("packages.edit", pkg.slug)}
                              className="px-2 py-1 rounded border bg-white hover:bg-gray-100 flex items-center gap-1 text-gray-700 transition-colors"
                            >
                              {I.edit}
                              <span>Edit</span>
                            </a>
                          </div>
                        </div>

                        {/* row 2 */}
                        <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
                          {pkg.qr_code_path ? (
                            <button
                              className="rounded-md bg-black text-white px-2.5 py-1 text-xs font-medium hover:bg-gray-800 transition"
                              onClick={() => {
                                setSharePkg(pkg);
                                setSharePropertyTitle(p.title);
                              }}
                            >
                              Share / QR / WhatsApp
                            </button>
                          ) : (
                            <div className="text-[11px] text-gray-500 italic">
                              No QR available
                            </div>
                          )}

                          <button
                            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium transition pr-5"
                            onClick={() => setConfirmStay(pkg)}
                          >
                            {I.del}
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed">
                No stays yet — add your first stay to generate a guest Welcome
                Page, QR code, and WhatsApp share link.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* pagination */}
      <Paginator links={properties.links} />

      {/* delete property modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold">Delete property?</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will remove the property, its packages, sections and visits.
            </p>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 transition-colors"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                onClick={() => doDelete(confirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete stay modal */}
      {confirmStay && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold">Delete this stay?</h3>

            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {confirmStay.guest_first_name
                ? `This will remove ${confirmStay.guest_first_name}'s welcome package.`
                : `This will remove this welcome package.`}
              <br />
              Dates:{" "}
              {confirmStay.check_in_date
                ? `${confirmStay.check_in_date} → ${confirmStay.check_out_date}`
                : "—"}
            </p>

            <div className="mt-4 flex gap-3 justify-end">
              <button
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 transition-colors"
                onClick={() => setConfirmStay(null)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                onClick={() => deleteStay(confirmStay.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* share modal */}
      {sharePkg && (
        <ShareStayModal
          pkg={sharePkg}
          propertyTitle={sharePropertyTitle}
          onClose={() => setSharePkg(null)}
        />
      )}
    </Shell>
  );
}
