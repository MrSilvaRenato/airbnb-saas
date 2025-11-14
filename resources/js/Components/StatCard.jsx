// resources/js/Components/StatCard.jsx
import React from "react";

const tones = {
  sky:    { ring: "ring-sky-200",    chip: "bg-sky-50 text-sky-700",    icon: "bg-sky-100 text-sky-600" },
  emerald:{ ring: "ring-emerald-200",chip: "bg-emerald-50 text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  violet: { ring: "ring-violet-200", chip: "bg-violet-50 text-violet-700",  icon: "bg-violet-100 text-violet-600" },
  amber:  { ring: "ring-amber-200",  chip: "bg-amber-50 text-amber-700",   icon: "bg-amber-100 text-amber-600" },
  gray:   { ring: "ring-gray-200",   chip: "bg-gray-50 text-gray-700",    icon: "bg-gray-100 text-gray-600" },
};

export default function StatCard({ title, value, hint, tone = "gray", icon, action }) {
  const t = tones[tone] ?? tones.gray;
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ring-1 ${t.ring}`}>
      <div className="flex items-start gap-3">
        {icon && <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${t.icon}`}>{icon}</div>}
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{title}</div>
          <div className="text-2xl font-bold text-gray-900 leading-snug">{value}</div>
          {hint && <div className="text-[11px] text-gray-500 mt-0.5">{hint}</div>}
          {action ? (
            <button
              onClick={action.onClick}
              className="mt-2 inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-gray-50"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
