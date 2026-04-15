// resources/js/Pages/Host/Dashboard.jsx
import React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import Shell from "@/Layouts/Shell";
import StatCard from "@/Components/StatCard";
import ShareStayModal from "@/Components/ShareStayModal";
import OnboardingWizard from "@/Components/OnboardingWizard";
import EmptyState from "@/Components/EmptyState";

// date formatter
const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString() : "--";

// status pill logic for each stay
function stayStatus(pkg) {
  if (pkg?.status === "cancelled") {
    return { label: "Cancelled stay", tone: "red" };
  }
  const hasDates = pkg?.check_in_date && pkg?.check_out_date;
  if (!hasDates) return { label: "Draft", tone: "amber" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(pkg.check_in_date + "T00:00:00");
  const end = new Date(pkg.check_out_date + "T00:00:00");

  if (today >= start && today <= end) return { label: "Ongoing", tone: "emerald" };

  if (today < start) {
    const msDiff = start - today;
    const daysUntil = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    const text = daysUntil === 0 ? "Today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
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

const PLAN_LABEL = { free: 'Starter', growth: 'Growth', host: 'Growth', pro: 'Pro', agency: 'Agency' };

export default function Dashboard() {
  const {
    properties,
    totals,
    filters,
    userMeta,
    limits,
    recentlyUpgraded,
    activities = [],
  recentActivities,
    stays = [],
    onboarding = { step: 0, skipped: false },
  } = usePage().props;

  const firstName = userMeta?.first_name || "Host";
  const currentPlan = userMeta?.plan ?? 'free';
  const isFreePlan = currentPlan === "free";
  const blockedOnProperty = limits && !limits.canCreateProperty;
  const blockedOnStay = limits && !limits.canCreateStay;
  const showUpgradeBanner = isFreePlan && (blockedOnProperty || blockedOnStay);

  // After checkout, the webhook may not have fired yet. If plan is still free,
  // poll the server every 4 seconds until the plan is activated (up to 30s).
  const upgradeProcessing = recentlyUpgraded && isFreePlan;
  React.useEffect(() => {
    if (!upgradeProcessing) return;
    const interval = setInterval(() => {
      router.reload({ only: ['userMeta', 'limits', 'auth'], preserveScroll: true });
    }, 4000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [upgradeProcessing]);

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

  // --- NEW: compute next upcoming / ongoing stay (for header) ---
const nextInfo = React.useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let pick = null; // {pkg, propertyTitle, start, end, isOngoing}

  items.forEach((p) => {
    (p.welcome_packages || []).forEach((pkg) => {
      if (!pkg.check_in_date || !pkg.check_out_date) return;
      if (pkg.status === "cancelled") return;

      const start = new Date(pkg.check_in_date + "T00:00:00");
      const end = new Date(pkg.check_out_date + "T00:00:00");

      // 🔴 KEY FIX: ignore fully ended stays
      if (end < today) return;

      const candidate = {
        pkg,
        propertyTitle: p.title,
        start,
        end,
        isOngoing: today >= start && today <= end,
      };

      // Prefer ongoing; else earliest upcoming
      if (!pick) {
        pick = candidate;
        return;
      }

      if (candidate.isOngoing && !pick.isOngoing) {
        pick = candidate;
        return;
      }

      if (!candidate.isOngoing && !pick.isOngoing) {
        if (candidate.start < pick.start) pick = candidate;
      }
    });
  });

  if (!pick) return null;

    const daysUntil =
      pick.isOngoing
        ? 0
        : Math.ceil((pick.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...pick,
      daysUntil,
      status: stayStatus(pick.pkg),
    };
  }, [items]);
// --- NEW: KPI calculations for stat cards ---
const { arrivingSoon, activeNow, scans7d, unsentCount, firstUnsentPkg, firstUnsentPropTitle } =
  React.useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);

    const pkgs = items.flatMap(p => (p.welcome_packages || []).map(pkg => ({ pkg, pTitle: p.title })));

    const inNextNDays = (start, n) => {
      const d = new Date(start + "T00:00:00"); d.setHours(0,0,0,0);
      const diff = Math.ceil((d - today) / (1000*60*60*24));
      return diff >= 0 && diff <= n;
    };

    let arrivingSoon = 0;
    let activeNow = 0;
    let unsentCount = 0;
    let firstUnsentPkg = null;
    let firstUnsentPropTitle = "";

    pkgs.forEach(({ pkg, pTitle }) => {
      if (pkg.status === "cancelled") return;
      if (pkg.check_in_date && pkg.check_out_date) {
        const start = new Date(pkg.check_in_date + "T00:00:00");
        const end   = new Date(pkg.check_out_date + "T00:00:00");
        if (today >= start && today <= end) activeNow += 1;
        if (inNextNDays(pkg.check_in_date, 3)) arrivingSoon += 1;
      }
      // Heuristic: treat missing QR as “unsent”
      if (!pkg.qr_code_path && !firstUnsentPkg) {
        firstUnsentPkg = pkg; firstUnsentPropTitle = pTitle;
      }
      if (!pkg.qr_code_path) unsentCount += 1;
    });

    return {
      arrivingSoon,
      activeNow,
      scans7d: totals?.visits7d || 0,
      unsentCount,
      firstUnsentPkg,
      firstUnsentPropTitle
    };
  }, [items, totals?.visits7d]);

    const setupPercent = React.useMemo(() => {
  // simple heuristic: 4 checks worth 25% each
  let score = 0;
  const hasProperty = items.length > 0;                             // created a property
  const hasWifi = items.some(p => p.wifi_name && p.wifi_password);  // set Wi-Fi once
  const hasStay = items.some(p => (p.welcome_packages||[]).length); // created at least one stay
  const hasBranding = userMeta?.plan === 'pro' &&
    items.some(p => p.brand_display_name || p.brand_logo_path);     // pro branding filled

  if (hasProperty) score += 25;
  if (hasWifi)     score += 25;
  if (hasStay)     score += 25;
  if (hasBranding) score += 25;

  return score; // 0–100
}, [items, userMeta?.plan]);


// --- helpers ---
// helper
const timeAgo = (iso) => {
  const d = new Date(iso); const s = Math.floor((Date.now()-d.getTime())/1000);
  const m = Math.floor(s/60), h = Math.floor(m/60), d2 = Math.floor(h/24);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d2}d ago`;
};

// flatten packages with property title for lists
const flatPkgs = React.useMemo(
  () =>
    items.flatMap((p) =>
      (p.welcome_packages || []).map((pkg) => ({
        ...pkg,
        _propTitle: p.title,
      }))
    ),
  [items]
);

// --- NEW: action-center datasets ---
const actionData = React.useMemo(() => {
  const today = new Date(); today.setHours(0,0,0,0);

  const inNextNDays = (start, n) => {
    if (!start) return false;
    const d = new Date(start + "T00:00:00"); d.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / (1000*60*60*24));
    return diff >= 0 && diff <= n;
  };

  const arrivingSoon = [];
  const unsent = [];
  const drafts = [];

  flatPkgs.forEach((pkg) => {
    if (pkg.status === "cancelled") return;

    if (!pkg.qr_code_path) unsent.push(pkg);

    const hasDates = pkg.check_in_date && pkg.check_out_date;
    if (!hasDates || !pkg.guest_first_name) drafts.push(pkg);

    if (pkg.check_in_date && inNextNDays(pkg.check_in_date, 3)) {
      arrivingSoon.push(pkg);
    }
  });

  // recent activity by updated_at desc
  const recent = [...flatPkgs]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 6);

  return {
    arrivingSoon: arrivingSoon.slice(0, 5),
    unsent: unsent.slice(0, 5),
    drafts: drafts.slice(0, 5),
    recent,
  };
}, [flatPkgs]);

const [confirmClearAct, setConfirmClearAct] = React.useState(false)



// map action → pill colors
const toneFor = (action = "") => {
  switch (action.toLowerCase()) {
    case "created":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "updated":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "deleted":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-200";
  }
};
// tiny inline icons
const IconPlus = () => (
  <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 ring-1 ring-emerald-100 text-emerald-700 w-7 h-7 shrink-0 [svg]:fill-none [svg]:stroke-current [svg]:shape-rendering-geometricPrecision">
  <svg
    viewBox="0 0 20 20" className="w-3.5 h-3.5"> <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg></span>
);
const IconPencil = () => (
  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5"><path d="M4 13.5V16h2.5l8-8-2.5-2.5-8 8zM12 6l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5"><path d="M6 6h8m-7 0v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6M7 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconHome = () => (
  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor"
       shapeRendering="geometricPrecision" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 10 4l7 5.5" />
    <path d="M5 9.5V16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9.5" />
  </svg>
);

const IconTicket = () => (
  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor"
       shapeRendering="geometricPrecision" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="6" width="12" height="8" rx="1.5" />
    <path d="M8 6v8M12 6v8" />
    {/* If you want a center notch, keep it stroked, not filled: */}
    {/* <circle cx="10" cy="10" r="1.5" /> */}
  </svg>
);


// action -> tone (bg/text) + icon
function activityVisual(a) {
  const isProperty = a.subjectType === 'Property';
  const isPackage  = a.subjectType === 'WelcomePackage';

  const base = {
    created: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', text: 'text-emerald-700', icon: IconPlus },
    updated: { bg: 'bg-blue-50',    ring: 'ring-blue-100',    text: 'text-blue-700',    icon: IconPencil },
    deleted: { bg: 'bg-rose-50',    ring: 'ring-rose-100',    text: 'text-rose-700',    icon: IconTrash },
  }[a.action] || { bg: 'bg-gray-50', ring: 'ring-gray-100', text: 'text-gray-700', icon: IconPencil };

  const typeIcon = isProperty ? IconHome : isPackage ? IconTicket : null;

  return { ...base, typeIcon };
}

const IconBroom = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18M8 17l1-5 9-9 3 3-9 9-5 1z" />
  </svg>
);
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
      {/* onboarding wizard */}
      <OnboardingWizard step={onboarding.step} skipped={onboarding.skipped} />

      {/* banners */}
      {recentlyUpgraded && upgradeProcessing ? (
        <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 mb-4 text-sm">
          <div className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            Activating your plan…
          </div>
          <div className="text-blue-700">
            Payment received — we’re activating your plan now. This page will update automatically in a few seconds.
          </div>
          <button onClick={() => router.reload()} className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
            Refresh now
          </button>
        </div>
      ) : recentlyUpgraded ? (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-50 p-4 mb-4 text-sm">
          <div className="font-semibold text-emerald-800 mb-1">
            Thanks, {firstName}! You’re on {PLAN_LABEL[currentPlan] ?? currentPlan} ✅
          </div>
          <div className="text-emerald-700">
            {currentPlan === 'agency'
             ? 'Everything is unlocked. Enjoy white-label guest pages, unlimited properties, full analytics, maintenance tracking, and priority support.'
: currentPlan === 'pro'
? 'Unlimited properties, full analytics, maintenance tracking, upsells, and branding are now unlocked.'
: 'Up to 5 properties, iCal sync, automated messaging, upsells, and branding are now unlocked.'}
          </div>
          <div className="text-emerald-700">{upgradedMsg}</div>
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

   {/* === NEW HEADER BLOCK === */}
<div className="mb-6 rounded-2xl border bg-white p-5">
  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    {/* Left: greeting + next check-in + progress */}
    <div className="min-w-0 flex-1">
      <div className="text-lg font-semibold text-gray-900">
        Welcome back, {firstName} 👋
      </div>

      {nextInfo ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-700">
          <span className="truncate">
            {nextInfo.isOngoing ? "Guest in house now:" : "Next check-in:"}{" "}
            <strong>
              {nextInfo.pkg.guest_first_name || "Guest"}
              {nextInfo.pkg.guest_count ? ` (${nextInfo.pkg.guest_count})` : ""}
            </strong>{" "}
            at <strong>{nextInfo.propertyTitle}</strong>{" "}
            • {fmtDate(nextInfo.pkg.check_in_date)} → {fmtDate(nextInfo.pkg.check_out_date)}
          </span>

          <span
            className={`text-[10px] rounded-full border px-2 py-0.5 ${toneClass(
              nextInfo.status.tone
            )}`}
          >
            {nextInfo.status.label}
          </span>

          <button
            className="ml-1 inline-flex items-center rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800"
            onClick={() => {
              setSharePkg(nextInfo.pkg);
              setSharePropertyTitle(nextInfo.propertyTitle);
            }}
          >
            Send guest link
          </button>
        </div>
      ) : (
        <div className="mt-1 text-sm text-gray-600">
          No upcoming stays.{" "}
          {items.length ? (
            <button
              className="underline underline-offset-2"
              onClick={() => {
                if (!limits?.canCreateStay) return;
                router.visit(route("packages.create", items[0].id));
              }}
            >
              Create your next stay
            </button>
          ) : (
            <button
              className="underline underline-offset-2"
              onClick={() => router.visit(route("properties.create"))}
            >
              Add your first property
            </button>
          )}
          .
        </div>
      )}

      {/* Setup progress */}
      <div className="mt-4">
        <div className="text-[11px] text-gray-600">
          Setup {setupPercent}% complete
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gray-900 transition-all"
            style={{ width: `${setupPercent}%` }}
          />
        </div>
      </div>
    </div>

    {/* Right: plan label */}
    <div className="shrink-0 min-w-[220px] text-left md:text-right">
      {(() => {
        const plan = (userMeta?.plan || "free").toLowerCase();

        const planMap = {
          free: {
            label: "FREE",
            className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
            action: "Upgrade",
            href: route("checkout.show"),
          },
          growth: {
            label: "GROWTH",
            className:
              "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 text-stone-900 ring-1 ring-amber-200/60 shadow-md",
            action: "Billing",
            href: route("billing.manage"),
          },
          pro: {
            label: "PRO",
            className:
              "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 text-stone-900 ring-1 ring-amber-200/70 shadow-md",
            action: "Billing",
            href: route("billing.manage"),
          },
          agency: {
            label: "AGENCY",
            className:
              "bg-gradient-to-r from-stone-900 via-amber-500 to-stone-800 text-white ring-1 ring-amber-300/40 shadow-md",
            action: "Billing",
            href: route("billing.manage"),
          },
        };

        const current = planMap[plan] || planMap.free;

        return (
          <div
            className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
          >
            <span className="tracking-[0.12em]">{current.label}</span>

            <Link
              href={current.href}
              className={
                plan === "free"
                  ? "underline underline-offset-2 hover:opacity-80"
                  : "hover:opacity-80"
              }
            >
              {current.action}
            </Link>
          </div>
        );
      })()}
    </div>
  </div>
</div>
{/* === END HEADER BLOCK === */}

      {/* Filters + KPI row */}
      <div className="rounded-2xl border bg-white p-4 mb-1">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
         
         {/* right: colorful KPIs */}
<div className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto gap-16">
  <StatCard
    title="Guests arriving soon"
    value={arrivingSoon}
    hint="within 3 days"
    tone="sky"
    icon={<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 7v5l4 2l-.75 1.23L11 12V7h1m0-5a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Z"/></svg>}
  />
  <StatCard
    title="Active stays"
    value={activeNow}
    hint="in house today"
    tone="emerald"
    icon={<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m-1 15l-5-5l1.41-1.41L11 13.17l5.59-5.59L18 9z"/></svg>}
  />
  <StatCard
    title="Total scans this week"
    value={scans7d}
    hint="7-day QR views"
    tone="violet"
    icon={<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3 3h4v18H3V3m7 8h4v10h-4V11m7-6h4v16h-4V5"/></svg>}
  />
  <StatCard
    title="Unsent welcome links"
    value={unsentCount}
    hint="packages without QR"
    tone="amber"
    icon={<svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M10.59 13.41L9.17 12l5-5l1.41 1.41l-5 5M7 2h10a2 2 0 0 1 2 2v14l-5-2l-5 2V4a2 2 0 0 1 2-2Z"/></svg>}
    action={
      unsentCount > 0
        ? {
            label: "Send first link",
            onClick: () => {
              if (!firstUnsentPkg) return;
              setSharePkg(firstUnsentPkg);
              setSharePropertyTitle(firstUnsentPropTitle || "");
            },
          }
        : null
    }
  />
</div>

        </div>
        
      </div>

{/* Filters */}
<div className="rounded-2xl border bg-white p-4 mb-8">
  <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center pt-2">
    <input
      className="border rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-[220px]"
      placeholder="Search properties…"
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && submitFilters()}
    />

    <select
      className="border rounded-lg px-3 py-2 pr-8 bg-white text-sm leading-none focus:outline-none focus:ring-2 focus:ring-black/10 appearance-none"
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
      className="border rounded-lg px-3 py-2 pr-8 bg-white text-sm leading-none focus:outline-none focus:ring-2 focus:ring-black/10 appearance-none"
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
</div>

{/* MAIN GRID: Properties (left) + Sticky Sidebar (right) */}
<div className="grid lg:grid-cols-3 gap-6">
  {/* LEFT: Properties list (2/3 width) */}
  <div className="lg:col-span-2">
    {/* Properties grid */}
    {items.length === 0 ? (
      <EmptyState
        icon="property"
        heading="No properties yet"
        body="Add your first property to start sending digital welcome packages to guests."
        cta={{ label: 'Add your first property', href: route('properties.create') }}
      />
    ) : (
    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
                <div className="text-sm text-gray-600 truncate">{p.address}</div>
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

            <Link
              href={route("upsells.index", p.id)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>💰</span>
              <span>Upsells</span>
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
                    const hasDates = pkg.check_in_date && pkg.check_out_date;

                    const start = hasDates
                      ? new Date(pkg.check_in_date + "T00:00:00")
                      : null;
                    const end = hasDates
                      ? new Date(pkg.check_out_date + "T00:00:00")
                      : null;

                    if (hasDates && today >= start && today <= end)
                      return { grp: 0, key: 0 };

                    if (hasDates && today < start) {
                      const daysUntil = Math.ceil(
                        (start - today) / (1000 * 60 * 60 * 24)
                      );
                      return { grp: 1, key: daysUntil };
                    }

                    if (pkg.status === "cancelled") return { grp: 3, key: 9999 };

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
                              {pkg.guest_count ? ` (${pkg.guest_count})` : ""}
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
                      {/* Maintenance acitivity */}
                      {recentActivities?.length > 0 && (
                      <div className="mt-6 bg-white rounded-xl border p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Recent Activity
                        </p>

                        {recentActivities.map((a) => (
                          <div key={a.id} className="text-sm text-gray-600 mb-1">
                            {a.title}
                          </div>
                        ))}
                      </div>
                    )}
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
    )}

    {/* pagination */}
    {items.length > 0 && <Paginator links={properties.links} />}
  </div>

  {/* RIGHT: Sticky sidebar (Action Center + Recent) */}
  <aside className="lg:col-span-1 lg:order-first">
    <div className="lg:sticky lg:top-24 space-y-4">
      {/* Action Center */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Action Center</h3>
          <span className="text-xs text-gray-500">Quick tasks</span>
        </div>
        <div className="mt-3 space-y-3">
          {/* Arrivals soon */}
          <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="currentColor" d="M12 7v5l4 2l-.75 1.23L11 12V7h1m0-5a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Z"/>
                </svg>
              </span>
              <div className="text-sm font-medium">Guests arriving in next 3 days</div>
              <span className="ml-auto text-xs text-gray-500">{actionData.arrivingSoon.length}</span>
            </div>
            {actionData.arrivingSoon.length ? (
              <ul className="space-y-2">
                {actionData.arrivingSoon.map((pkg) => (
                  <li key={pkg.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 truncate">
                      <span className="font-medium truncate">{pkg.guest_first_name || "Guest"}</span>
                      <span className="text-gray-500"> • {pkg._propTitle}</span>
                      <div className="text-[11px] text-gray-500">
                        {pkg.check_in_date} → {pkg.check_out_date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`/p/${pkg.slug}`} target="_blank" className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Open</a>
                      <a href={route("packages.edit", pkg.slug)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Edit</a>
                      <button
                        onClick={() => { setSharePkg(pkg); setSharePropertyTitle(pkg._propTitle); }}
                        className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-gray-800"
                      >
                        Send link
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">No upcoming arrivals.</div>
            )}
          </div>

          {/* Unsent links */}
          {/* <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="currentColor" d="M10.59 13.41L9.17 12l5-5l1.41 1.41l-5 5M7 2h10a2 2 0 0 1 2 2v14l-5-2l-5 2V4a2 2 0 0 1 2-2Z"/>
                </svg>
              </span>
              <div className="text-sm font-medium">Unsent welcome links</div>
              <span className="ml-auto text-xs text-gray-500">{actionData.unsent.length}</span>
            </div>
            {actionData.unsent.length ? (
              <ul className="space-y-2">
                {actionData.unsent.map((pkg) => (
                  <li key={pkg.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 truncate">
                      <span className="font-medium truncate">{pkg.guest_first_name || "Guest"}</span>
                      <span className="text-gray-500"> • {pkg._propTitle}</span>
                    </div>
                    <button
                      onClick={() => { setSharePkg(pkg); setSharePropertyTitle(pkg._propTitle); }}
                      className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-gray-800"
                    >
                      Send link
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">All good — no pending links.</div>
            )}
          </div> */}

          {/* Drafts */}
          {/* <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="currentColor" d="M3 3h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/>
                </svg>
              </span>
              <div className="text-sm font-medium">Draft packages (missing dates or guest)</div>
              <span className="ml-auto text-xs text-gray-500">{actionData.drafts.length}</span>
            </div>
            {actionData.drafts.length ? (
              <ul className="space-y-2">
                {actionData.drafts.map((pkg) => (
                  <li key={pkg.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 truncate">
                      <span className="font-medium truncate">{pkg.guest_first_name || "Guest"}</span>
                      <span className="text-gray-500"> • {pkg._propTitle}</span>
                    </div>
                    <a href={route("packages.edit", pkg.slug)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Complete</a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">No drafts need attention.</div>
            )}
          </div> */}
        </div>
      </div>

      {/* Upcoming Stays */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Upcoming Stays</h3>
          <a href={route('host.calendar')} className="text-xs text-indigo-600 hover:underline">View calendar →</a>
        </div>
        {(() => {
          const today = new Date().toISOString().slice(0,10)
          const upcoming = (stays || []).filter(s => s.check_in_date >= today).slice(0,6)
          if (!upcoming.length) return <div className="py-6 text-center text-xs text-gray-400">No upcoming stays scheduled.</div>
          return (
            <ul className="divide-y">
              {upcoming.map(s => {
                const nights = Math.round((new Date(s.check_out_date) - new Date(s.check_in_date)) / 86400000)
                const daysUntil = Math.round((new Date(s.check_in_date + 'T00:00:00') - new Date()) / 86400000)
                return (
                  <li key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{s.guest_first_name || 'Guest'}</div>
                      <div className="text-xs text-gray-400 truncate">{s.property_title} · {nights}n · {s.check_in_date}</div>
                    </div>
                    <span className={'text-xs font-bold px-2 py-1 rounded-full shrink-0 ' + (daysUntil <= 0 ? 'bg-red-100 text-red-600' : daysUntil <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                      {daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil + 'd'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )
        })()}
      </div>
        </div>
      </aside>
    </div>


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
