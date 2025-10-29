import React from 'react'
import { Head, usePage } from '@inertiajs/react'

/** tiny inline icons (no extra deps) */
const Icon = {
  wifi: (props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4m7.07-5.93l-1.41 1.41A9 9 0 0 0 12 13a9 9 0 0 0-5.66 2.48l-1.41-1.41A11 11 0 0 1 12 11c3.04 0 5.8 1.23 7.07 3.07M22 9.07l-1.41 1.41A14.97 14.97 0 0 0 12 7c-3.89 0-7.43 1.58-9.9 4.14L.69 9.07A16.97 16.97 0 0 1 12 5c4.73 0 9 1.92 12 4.07z"/></svg>),
  map:  (props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M15 19l-6 3l-6-3V5l6 3l6-3l6 3v14l-6-3zM9 7v12l6-3V4z"/></svg>),
  phone:(props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M20 15.5a16.1 16.1 0 0 1-5.5-1 1 1 0 0 0-1 .25l-2.2 2.2A15.05 15.05 0 0 1 5 8.7l2.2-2.2a1 1 0 0 0 .25-1A16.1 16.1 0 0 1 6.5 0h-3A1.5 1.5 0 0 0 2 1.5A20.5 20.5 0 0 0 22.5 22a1.5 1.5 0 0 0 1.5-1.5v-3a1 1 0 0 0-1-1z"/></svg>),
  share:(props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A2.99 2.99 0 1 0 14 5a3 3 0 0 0 .05.53L7.05 9.64A3 3 0 1 0 7 14a3 3 0 0 0 1.96-.77l7.12 4.18c-.05.19-.08.39-.08.59a3 3 0 1 0 3-2.92"/></svg>),
  rule:(props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z"/></svg>),
  info:(props)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" {...props}><path fill="currentColor" d="M11 17h2v-6h-2zm0-8h2V7h-2zm1-7a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2"/></svg>),
};

// collapsible section card for rules / how-tos / etc
const SectionCard = ({icon, title, children, defaultOpen=false})=>{
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="rounded-2xl border p-0 overflow-hidden bg-white">
      <button
        onClick={()=>setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-gray-500">{icon}</span>
        <span className="font-semibold">{title}</span>
        <span className="ml-auto text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-gray-700 whitespace-pre-wrap">
          {children}
        </div>
      )}
    </div>
  )
}

// clipboard helper (works even if not https)
async function copy(text){
  try{
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text); 
      return true;
    }
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.style.position='fixed';
    ta.style.left='-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok=document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch{
    return false;
  }
}

// friendly greeting logic
function buildWelcomeLine(pkg) {
  const name = pkg.guest_first_name || "Guest";

  if (!pkg.check_in_date) {
    return `Welcome, ${name}! 👋`;
  }

  const today = new Date(); 
  today.setHours(0,0,0,0);
  const start = new Date(pkg.check_in_date + "T00:00:00");

  const diffDays = Math.ceil((start - today)/(1000*60*60*24));

  if (diffDays === 0) {
    return `Welcome, ${name}! Your check-in is today 🎉`;
  }
  if (diffDays > 0) {
    return `Hi ${name}, your stay starts in ${diffDays} day${diffDays>1?"s":""} ✈️`;
  }
  return `Welcome back, ${name}! Enjoy your stay 🌟`;
}

export default function Package() {
  const { pkg, branding } = usePage().props;


  
  // NOTE: in your controller you're probably passing:
  // - pkg.address (property address)
  // - pkg.title (property title or package title)
  // - pkg.quick = { wifi_name, wifi_password, host_phone, smart_lock_code, check_in_date, check_out_date }
  // We keep using that shape.

  const quick = pkg.quick || {};
  const offline = !navigator.onLine;

  const mapsUrl = pkg.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.address)}`
    : null;

  const [copied, setCopied] = React.useState(null);

  const shareData = {
    title: pkg.title,
    text: `Welcome to ${pkg.title}!`,
    url: window.location.href,
  };

  const fmt = (d)=> d ? new Date(d + 'T00:00:00').toLocaleDateString() : '--';

  const iconFor = (type)=>{
    if(type==='house_rule') return <Icon.rule/>;
    if(type==='guide')      return <Icon.map/>;
    if(type==='contact')    return <Icon.phone/>;
    if(type==='info' || type==='faq') return <Icon.info/>;
    return <Icon.info/>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head title={pkg.title} />

      {/* TOP: concierge-style hero block */}
      
{/* PAGE CONTAINER */}
<div className="px-4 pt-8 pb-4 max-w-2xl mx-auto">

  {/* UNIFIED CARD (hero + contact tiles live inside this) */}
  <div className="rounded-3xl shadow-lg overflow-hidden">

    {/* HERO / BRAND HEADER (dark top strip) */}
    <div className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white p-4">
      {/* row that can wrap on tiny screens */}
      <div className="flex flex-wrap items-start gap-4">

{branding?.logo_url && (
  <div className="shrink-0 w-28 h-28 rounded-xl border border-white/30 bg-white shadow-md flex items-center justify-center overflow-hidden">
    <img
      src={branding.logo_url}
      alt="Host Logo"
      className="max-w-full max-h-full object-contain"
    />
  </div>
)}

        {/* RIGHT: text/content */}
        <div className="flex-1 min-w-[200px] text-white">

          {/* Headline (brand or fallback greeting) */}
          <div className="text-xl font-semibold leading-snug text-white break-words">
            {branding?.display_name
              ? branding.display_name
              : buildWelcomeLine(pkg)}
          </div>

          {/* Address / property line */}
          <div className="text-[11px] text-gray-300 leading-tight mt-2">
            {pkg.address}
            {pkg.title ? ` • ${pkg.title}` : ''}
            
          </div>

          {/* Pills row: dates / Welcome Package / Offline */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium mt-3">
            {(quick.check_in_date || quick.check_out_date) && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {fmt(quick.check_in_date)} → {fmt(quick.check_out_date)}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
              Welcome Package
            </span>

            {offline && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-200 border border-yellow-300/30">
                Offline
              </span>
            )}
          </div>

        </div>
      </div>
    </div>

  </div>
</div>


      {/* PERSONAL TILES: Wi-Fi + Host Contact */}
      <div className="px-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">

          {/* Wi-Fi tile */}
          <div className="border rounded-xl p-3 bg-white shadow-sm">
            <div className="text-[11px] text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Icon.wifi /> <span>Wi-Fi</span>
            </div>
            <div className="font-medium text-gray-900 break-all">
              {quick.wifi_name || "—"}
            </div>
            <div className="text-gray-700 break-all text-xs">
              {quick.wifi_password || "—"}
            </div>
            {(quick.wifi_name || quick.wifi_password) && (
              <button
                className="mt-2 text-[11px] underline text-emerald-600"
                onClick={async () => {
                  const text = quick.wifi_password
                    ? `${quick.wifi_name} / ${quick.wifi_password}`
                    : quick.wifi_name;
                  const ok = await copy(text);
                  setCopied(ok ? 'wifi_tile' : null);
                }}
              >
                {copied === 'wifi_tile' ? 'Copied!' : 'Copy Wi-Fi'}
              </button>
            )}
          </div>

          {/* Host Contact tile */}
          <div className="border rounded-xl p-3 bg-white shadow-sm">
            <div className="text-[11px] text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Icon.phone /> <span>
  {branding?.contact_label
    ? branding.contact_label
    : "Host Contact"}
</span>

            </div>
            <div className="font-medium text-gray-900">
              {quick.host_phone || "Not provided"}
            </div>
            {quick.host_phone && (
              <a
                className="text-[11px] underline text-emerald-600"
                href={`tel:${quick.host_phone}`}
              >
                Call now
              </a>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTION GRID (Wi-Fi / Maps / Call / Smart Lock / Share) */}
      <div className="px-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5 text-sm">

          {/* Wi-Fi quick button */}
          {quick.wifi_name && (
            <button
              className="rounded-xl border bg-white px-3 py-2 flex flex-col items-center justify-center text-center gap-1"
              onClick={async () => {
                const text = quick.wifi_password
                  ? `${quick.wifi_name} / ${quick.wifi_password}`
                  : quick.wifi_name;
                const ok = await copy(text);
                setCopied(ok ? 'wifi' : null);
              }}
            >
              <Icon.wifi />
              <span className="font-medium leading-tight">
                {copied === 'wifi' ? 'Copied!' : 'Wi-Fi'}
              </span>
            </button>
          )}

          {/* Maps */}
          {pkg.address && (
            <a
              className="rounded-xl border bg-white px-3 py-2 flex flex-col items-center justify-center text-center gap-1"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon.map />
              <span className="font-medium leading-tight">Maps</span>
            </a>
          )}

          {/* Call Host */}
          {quick.host_phone && (
            <a
              className="rounded-xl border bg-white px-3 py-2 flex flex-col items-center justify-center text-center gap-1"
              href={`tel:${quick.host_phone}`}
            >
              <Icon.phone />
              <span className="font-medium leading-tight">Call Host</span>
            </a>
          )}

          {/* Smart Lock */}
          {quick.smart_lock_code && (
            <button
              className="rounded-xl border bg-white px-3 py-2 flex flex-col items-center justify-center text-center gap-1"
              onClick={async () => {
                const ok = await copy(quick.smart_lock_code);
                if (ok) alert('Smart lock code copied');
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4m6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2M9 9a3 3 0 0 1 6 0v2H9z"
                />
              </svg>
              <span className="font-medium leading-tight">Smart Lock</span>
            </button>
          )}

          {/* Share */}
          <button
            className="rounded-xl border bg-white px-3 py-2 flex flex-col items-center justify-center text-center gap-1"
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                  return;
                } catch {/* fall back to copy */}
              }
              const ok = await copy(window.location.href);
              setCopied(ok ? 'share' : null);
            }}
          >
            <Icon.share />
            <span className="font-medium leading-tight">
              {copied === 'share' ? 'Copied!' : 'Share'}
            </span>
          </button>
        </div>
      </div>

      {/* Sections list */}
      <div className="px-4 pb-10 max-w-2xl mx-auto grid gap-3">
        {pkg.sections
          .sort((a,b)=>a.sort_order-b.sort_order)
          .map((s, i)=>(
            <SectionCard
              key={i}
              icon={iconFor(s.type)}
              title={s.title}
              defaultOpen={i < 2}
            >
              {s.body}
            </SectionCard>
          ))}
      </div>

      {/* Sticky bottom bar (mobile helper) */}
      <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white border shadow-lg px-3 py-2 rounded-full">
        {pkg.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.address)}`}
            className="px-3 py-1.5 rounded-full bg-gray-100 text-sm"
            target="_blank"
            rel="noreferrer"
          >
            Open Maps
          </a>
        )}
        <button
          className="px-3 py-1.5 rounded-full bg-black text-white text-sm"
          onClick={async ()=>{
            if (navigator.share) {
              try { await navigator.share(shareData); return; } catch {}
            }
            await copy(window.location.href);
          }}
        >
          Share
        </button>
      </div>

      {/* footer mini brand */}
      <div className="text-center text-xs text-gray-400 pb-6 pt-8">
        AirBnB SaaS Dashboard
      </div>
    </div>
  )
}
