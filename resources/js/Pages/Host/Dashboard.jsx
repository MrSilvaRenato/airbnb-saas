import React from "react";
import axios from "axios";
import { Link, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";
import StatCard from "@/Components/StatCard";
import ShareStayModal from "@/Components/ShareStayModal";

// date formatter
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "--");

// status pill logic for each stay
function stayStatus(pkg) {
  // cancelled overrides everything
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

  // guest is currently staying
  if (today >= start && today <= end) {
    return { label: "Ongoing", tone: "emerald" };
  }

  // future stay
  if (today < start) {
    const msDiff = start - today;
    const daysUntil = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    // “in 1 day”, “in 2 days”, etc.
    const text =
      daysUntil === 0 ? "Today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;

    return { label: text, tone: "sky" };
  }

  // past stay
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

// clipboard copy helper
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// icons
const I = {
  qr: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M3 3h8v8H3zm2 2v4h4V5zM13 3h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zM18 13h-3v2h3v3h2v-5zM13 18h3v3h-3zM18 18h2v3h-2z"
      />
    </svg>
  ),
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
  copy: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12zM20 5H8a2 2 0 0 0-2 2v14h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h12z"
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
    <div className="flex flex-wrap gap-2 mt-6">
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
  // -----------------
  // incoming props
  // -----------------
  const {
    properties,
    totals,
    filters,
    userMeta,
    limits,
  } = usePage().props;

  const items = properties.data;

  // -----------------
  // local UI state
  // -----------------
  const [sharePkg, setSharePkg] = React.useState(null);
  const [sharePropertyTitle, setSharePropertyTitle] = React.useState("");
  const [q, setQ] = React.useState(filters.q || "");
  const [sort, setSort] = React.useState(filters.sort || "new");
  const [perPage, setPerPage] = React.useState(filters.perPage || 9);
  const [copiedId, setCopiedId] = React.useState(null);
  const [confirmId, setConfirmId] = React.useState(null);
  const [confirmStay, setConfirmStay] = React.useState(null);

  // -----------------
  // handlers
  // -----------------
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
        // If props don't refresh automatically, you can force reload pieces:
        // router.reload({ only: ["properties", "totals"] })
      },
    });
  };

  // 🔥 Stripe upgrade handler
async function handleUpgradeClick() {
  try {
    // Navigate to the upgrade comparison page
    router.visit(route("checkout.show"));
  } catch (err) {
    console.error("Navigation to checkout failed:", err);
    // optional: toast("Unable to open upgrade page. Please try again.");
  }
}

  // convenience booleans for UI
  const isFreePlan = userMeta?.plan === "free";
  const blockedOnProperty = limits && !limits.canCreateProperty;
  const blockedOnStay = limits && !limits.canCreateStay;
  const showUpgradeBanner = isFreePlan && (blockedOnProperty || blockedOnStay);

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
              : "") +
            "px-3 py-2 rounded-lg bg-black text-white"
          }
        >
          Add Property
        </button>
      }
    >
      {/* UPGRADE BANNER FOR FREE USERS AT LIMIT */}
      {showUpgradeBanner && (
        <div className="rounded-2xl border border-yellow-400 bg-yellow-50 p-4 mb-4 text-sm">
          <div className="font-semibold text-yellow-800 mb-1">
            You’ve hit the Free plan limit.
          </div>
          <div className="text-yellow-700 mb-3">
            Upgrade to Pro to add unlimited properties and active stays, plus
            unlock custom branding for your guest pages.
          </div>
          <button
            onClick={handleUpgradeClick}
            className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-white font-medium hover:bg-yellow-700"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Filters row */}
      <div className="rounded-2xl border bg-white p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            className="border rounded-lg p-2 flex-1"
            placeholder="Search properties…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitFilters()}
          />
          <select
            className="border rounded-lg p-2"
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
            className="border rounded-lg p-2"
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
            className="px-3 py-2 rounded-lg border"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Properties" value={totals.properties} />
        <StatCard label="Packages" value={totals.packages} />
        <StatCard label="Total Visits" value={totals.visits} />
        <StatCard label="Last 7 days" value={totals.visits7d} />
      </div>

      {/* Properties grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border bg-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header row: title + QR */}
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                {p.address && (
                  <div className="text-sm text-gray-600 truncate">{p.address}</div>
                )}
              </div>

              {/* mini QR from first stay */}
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

            {/* Controls row: Edit / New Stay / Delete */}
            <div className="flex flex-wrap gap-2 mt-1">
              <Link
                href={route("properties.edit", p.id)}
                className="px-3 py-1 rounded border text-sm flex items-center gap-1"
              >
                {I.edit} Edit
              </Link>

              <button
                disabled={!limits?.canCreateStay}
                onClick={() => {
                  if (!limits?.canCreateStay) return;
                  router.visit(route("packages.create", p.id));
                }}
                className={
                  (!limits?.canCreateStay
                    ? "opacity-50 cursor-not-allowed "
                    : "") +
                  "px-3 py-1 rounded bg-emerald-600 text-white text-sm flex items-center gap-1"
                }
              >
                + New Stay
              </button>

              <button
                className="px-3 py-1 rounded border text-sm text-red-600 flex items-center gap-1"
                onClick={() => setConfirmId(p.id)}
              >
                {I.del} Delete
              </button>
            </div>

            {/* Stays list */}
            {p.welcome_packages?.length ? (
              <div className="space-y-3 mt-2">
                {[...p.welcome_packages]
                  .sort((a, b) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    function bucket(pkg) {
                      const hasDates = pkg.check_in_date && pkg.check_out_date;

                      const start = hasDates
                        ? new Date(pkg.check_in_date + "T00:00:00")
                        : null;
                      const end = hasDates
                        ? new Date(pkg.check_out_date + "T00:00:00")
                        : null;

                      // ongoing
                      if (hasDates && today >= start && today <= end) {
                        return { grp: 0, key: 0 };
                      }

                      // upcoming
                      if (hasDates && today < start) {
                        const daysUntil = Math.ceil(
                          (start - today) / (1000 * 60 * 60 * 24)
                        );
                        return { grp: 1, key: daysUntil };
                      }

                      // cancelled
                      if (pkg.status === "cancelled") {
                        return { grp: 3, key: 9999 };
                      }

                      // past
                      if (hasDates && today > end) {
                        const daysAgo = Math.ceil(
                          (today - end) / (1000 * 60 * 60 * 24)
                        );
                        return { grp: 2, key: daysAgo };
                      }

                      // draft / no dates
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
                        className="relative border rounded-lg p-3 bg-gray-50 text-sm flex flex-col gap-2"
                      >
                        {/* top row */}
                        <div className="flex justify-between items-start flex-wrap gap-y-1">
                          {/* left side guest + pill + dates */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2 font-medium">
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

                            <div className="text-xs text-gray-600">
                              {fmtDate(pkg.check_in_date)} →{" "}
                              {fmtDate(pkg.check_out_date)}
                            </div>
                          </div>

                          {/* right side actions: Open / Edit */}
                          <div className="flex flex-wrap gap-1 shrink-0">
                            <a
                              href={`/p/${pkg.slug}`}
                              target="_blank"
                              className="text-xs px-2 py-1 border rounded flex items-center gap-1"
                            >
                              {I.link} Open
                            </a>

                            <a
                              href={route("packages.edit", pkg.slug)}
                              className="text-xs px-2 py-1 border rounded flex items-center gap-1"
                            >
                              {I.edit} Edit
                            </a>
                          </div>
                        </div>

                        {/* share row */}
                        {pkg.qr_code_path && (
                          <div className="flex flex-wrap items-center mt-1 gap-2">
                            <button
                              className="text-xs px-2 py-1 border rounded bg-black text-white"
                              onClick={() => {
                                setSharePkg(pkg);
                                setSharePropertyTitle(p.title);
                              }}
                            >
                              Share / QR / WhatsApp
                            </button>
                          </div>
                        )}

                        {/* delete stay button pinned bottom-right */}
                        <button
                          className="absolute bottom-2 right-2 text-[11px] px-2 py-1 border rounded text-red-600 flex items-center gap-1 bg-white"
                          onClick={() => setConfirmStay(pkg)}
                        >
                          {I.del} Delete
                        </button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No stays yet.</p>
            )}
          </div>
        ))}
      </div>

      {/* pagination */}
      <Paginator links={properties.links} />

      {/* delete property confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Delete property?</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will remove the property, its packages, sections and visits.
            </p>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                className="px-3 py-2 rounded-lg border"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white"
                onClick={() => doDelete(confirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete stay confirmation modal */}
      {confirmStay && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Delete this stay?</h3>

            <p className="text-sm text-gray-600 mt-1">
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
                className="px-3 py-2 rounded-lg border"
                onClick={() => setConfirmStay(null)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white"
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
