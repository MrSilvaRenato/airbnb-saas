import React, { useState } from 'react'
import { Head, usePage, useForm } from '@inertiajs/react'

/* ─────────────────────────────────────────────
   INLINE SVG ICONS  (zero external deps)
───────────────────────────────────────────── */
const Icons = {
  wifi: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4m7.07-5.93-1.41 1.41A9 9 0 0 0 12 13a9 9 0 0 0-5.66 2.48L4.93 14.07A11 11 0 0 1 12 11c3.04 0 5.8 1.23 7.07 3.07M22 9.07l-1.41 1.41A14.97 14.97 0 0 0 12 7c-3.89 0-7.43 1.58-9.9 4.14L.69 9.07A16.97 16.97 0 0 1 12 5c4.73 0 9 1.92 12 4.07z"/>
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4m6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2M9 9a3 3 0 0 1 6 0v2H9z"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M20 15.5a16.1 16.1 0 0 1-5.5-1 1 1 0 0 0-1 .25l-2.2 2.2A15.05 15.05 0 0 1 5 8.7l2.2-2.2a1 1 0 0 0 .25-1A16.1 16.1 0 0 1 6.5 0h-3A1.5 1.5 0 0 0 2 1.5A20.5 20.5 0 0 0 22.5 22a1.5 1.5 0 0 0 1.5-1.5v-3a1 1 0 0 0-1-1z"/>
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V10h14zM5 8V6h14v2z"/>
    </svg>
  ),
  map: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M15 19 9 22 3 19V5l6 3 6-3 6 3v14l-6-3zM9 7v12l6-3V4z"/>
    </svg>
  ),
  share: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" {...p}>
      <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A2.99 2.99 0 1 0 14 5a3 3 0 0 0 .05.53L7.05 9.64A3 3 0 1 0 7 14a3 3 0 0 0 1.96-.77l7.12 4.18c-.05.19-.08.39-.08.59a3 3 0 1 0 3-2.92"/>
    </svg>
  ),
  copy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11z"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  // section-type icons
  rule: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z"/>
    </svg>
  ),
  info: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M11 17h2v-6h-2zm0-8h2V7h-2zm1-7a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2"/>
    </svg>
  ),
  faq: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 17h-2v-2h2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  ),
  guide: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1m0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5z"/>
    </svg>
  ),
  contact: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M20 0H4C2.9 0 2 .9 2 2v22l4-4h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2m0 18H5.17L4 19.17V2h16z"/>
    </svg>
  ),
  chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
    </svg>
  ),
  wifiKey: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
  offline: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" {...p}>
      <path fill="currentColor" d="M24 8.98A16.99 16.99 0 0 0 0 9c.34-.33.69-.65 1.05-.96l1.42 1.42C1.53 10.34.77 11.14 0 12c3.5-3.5 8.07-5.5 12.99-5.5 1.93 0 3.78.33 5.51.93L16.74 5.66C15.38 5.24 13.95 5 12.5 5c-4.11 0-7.83 1.5-10.68 4L.41 7.59A16.97 16.97 0 0 1 12.5 3c4.31 0 8.22 1.6 11.17 4.24L24 8.98zM20.85 13.73l-1.41-1.41A10.97 10.97 0 0 0 12.5 10c-2.69 0-5.15.95-7.05 2.51l-1.41-1.41A12.9 12.9 0 0 1 12.5 8c3.3 0 6.3 1.23 8.57 3.25l-.22.48zM3.5 5.5L2.09 4.09 1 5.18 19.82 24l1.09-1.09-1.16-1.16A16.94 16.94 0 0 0 12 5.5c-3.04 0-5.85.83-8.27 2.28L5.14 9.19A14.9 14.9 0 0 1 12 7.5c2.4 0 4.65.59 6.63 1.63L3.5 5.5z"/>
    </svg>
  ),
}

/* ─────────────────────────────────────────────
   CLIPBOARD HELPER  (works on http + https)
───────────────────────────────────────────── */
async function copyText(text) {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/* ─────────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────────── */
function fmt(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function fmtFull(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildGreeting(pkg) {
  const name = pkg.guest_first_name || 'Guest'
  if (!pkg.check_in_date) return `Welcome, ${name}!`
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(pkg.check_in_date + 'T00:00:00')
  const diff = Math.ceil((start - today) / 86400000)
  if (diff === 0) return `Welcome, ${name}!`
  if (diff > 0) return `See you soon, ${name}!`
  return `Welcome back, ${name}!`
}

/* ─────────────────────────────────────────────
   SECTION TYPE CONFIG
───────────────────────────────────────────── */
const SECTION_CONFIG = {
  house_rule: {
    label: 'House Rules',
    icon: Icons.rule,
    border: 'border-l-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  guide: {
    label: 'Guide',
    icon: Icons.guide,
    border: 'border-l-sky-400',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  faq: {
    label: 'FAQ',
    icon: Icons.faq,
    border: 'border-l-violet-400',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  contact: {
    label: 'Contact',
    icon: Icons.contact,
    border: 'border-l-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  info: {
    label: 'Info',
    icon: Icons.info,
    border: 'border-l-gray-400',
    badge: 'bg-gray-50 text-gray-600 border-gray-200',
  },
  other: {
    label: 'Note',
    icon: Icons.info,
    border: 'border-l-gray-400',
    badge: 'bg-gray-50 text-gray-600 border-gray-200',
  },
}

function getSectionConfig(type) {
  return SECTION_CONFIG[type] || SECTION_CONFIG.other
}

/* ─────────────────────────────────────────────
   SECTION CARD  (collapsible, smooth transition)
───────────────────────────────────────────── */
function SectionCard({ section, defaultOpen, onExpand }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const cfg = getSectionConfig(section.type)
  const Icon = cfg.icon

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-[3px] ${cfg.border} overflow-hidden`}
      data-section-id={section.id}
    >
      <button
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next && onExpand) onExpand(section.id)
        }}
        className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="flex-1 font-semibold text-gray-900 text-sm leading-snug">{section.title}</span>
        <span className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
          </svg>
        </span>
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? '2000px' : '0px' }}>
        <div className="px-4 pb-5 pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border mb-3 ${cfg.badge}`}>
            <Icon />{cfg.label}
          </span>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   QUICK TILE  (tap to copy / tap to action)
───────────────────────────────────────────── */
function QuickTile({ icon: TileIcon, label, value, onTap, href, copied }) {
  if (!value) return null

  const inner = (
    <div
      className={`
        flex flex-col gap-2
        rounded-2xl border min-w-[140px] px-4 py-3.5
        active:scale-95 transition-all duration-100
        cursor-pointer select-none
        ${copied ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 shadow-sm'}
      `}
    >
      <div className="flex items-center justify-between">
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-500'}`}>
          {copied ? <Icons.check /> : <TileIcon />}
        </span>
        {!href && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
            {copied ? 'Copied!' : 'Tap'}
          </span>
        )}
      </div>
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
        <div className="font-semibold text-gray-900 text-sm leading-tight break-all mt-0.5">{value}</div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block shrink-0">
        {inner}
      </a>
    )
  }

  return (
    <button onClick={onTap} className="block shrink-0 text-left">
      {inner}
    </button>
  )
}

/* ─────────────────────────────────────────────
   TOAST  ("Copied!" notification)
───────────────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <div
      aria-live="polite"
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2
        px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg
        flex items-center gap-2
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
      `}
    >
      <Icons.check className="text-emerald-400 w-4 h-4" />
      {message}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PROPERTY AVATAR  (logo or initials)
───────────────────────────────────────────── */
function PropertyAvatar({ logoUrl, title }) {
  if (logoUrl) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/20 overflow-hidden border border-white/30 flex items-center justify-center shrink-0">
        <img src={logoUrl} alt="Property logo" className="w-full h-full object-contain p-0.5" />
      </div>
    )
  }
  const initials = (title || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STICKY TOP BAR  (appears after hero scrolls out)
───────────────────────────────────────────── */
function StickyBar({ title, phone, visible }) {
  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm
        flex items-center justify-between px-4 py-2
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
      `}
    >
      <span className="text-sm font-semibold text-gray-900 truncate max-w-[60vw]">{title}</span>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold active:bg-emerald-600 transition-colors"
        >
          <Icons.phone className="w-3.5 h-3.5" />
          Call Host
        </a>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   OFFLINE BANNER
───────────────────────────────────────────── */
function OfflineBanner({ visible }) {
  if (!visible) return null
  return (
    <div className="sticky top-0 z-40 bg-amber-400 text-amber-900 px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
        <path d="M1 9l2 2c4.97-4.97 11.26-6.21 17.01-3.72L22 5C15.18 1.54 6.71 2.62 1 9zm8 8 3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4 2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.86 9.14 5 13z"/>
      </svg>
      You're offline — this page was loaded from cache
    </div>
  )
}

/* ─────────────────────────────────────────────
   UPSELL OFFER CARD
───────────────────────────────────────────── */
function UpsellCard({ offer, packageId, guestEmail, guestName }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const hasPaidPrice = offer.price && parseFloat(offer.price) > 0

  // shared form state for both request + pay
  const { data, setData, post, processing } = useForm({
    guest_email: guestEmail,
    guest_name:  guestName,
    message:     '',
    package_id:  packageId,
  })

  const submitRequest = (e) => {
    e.preventDefault()
    post(route('upsells.guest.request', offer.id), {
      onSuccess: () => { setDone(true); setOpen(false) },
    })
  }

  const submitPay = (e) => {
    e.preventDefault()
    // Redirects to Stripe Checkout — use standard form POST via Inertia
    post(route('upsells.guest.pay', offer.id))
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm text-green-700 font-medium">
        ✅ Request sent for <strong>{offer.title}</strong> — your host will be in touch!
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{offer.title}</p>
          {offer.description && <p className="text-gray-500 text-xs mt-0.5">{offer.description}</p>}
        </div>
        <span className="text-sm font-bold text-indigo-700 flex-shrink-0">
          {hasPaidPrice ? `A$${parseFloat(offer.price).toFixed(2)}` : 'Inquiry'}
        </span>
        {hasPaidPrice ? (
          <button onClick={() => setOpen(o => !o)}
            className="flex-shrink-0 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 active:scale-95 transition-transform">
            {open ? 'Cancel' : 'Pay now'}
          </button>
        ) : (
          <button onClick={() => setOpen(o => !o)}
            className="flex-shrink-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition-transform">
            {open ? 'Cancel' : 'Request'}
          </button>
        )}
      </div>
      {open && (
        <form onSubmit={hasPaidPrice ? submitPay : submitRequest}
          className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
          <input type="email" required placeholder="Your email" value={data.guest_email}
            onChange={e => setData('guest_email', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white" />
          <input type="text" placeholder="Your name (optional)" value={data.guest_name}
            onChange={e => setData('guest_name', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white" />
          <textarea placeholder="Any message? (optional)" value={data.message}
            onChange={e => setData('message', e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none bg-white" />
          {hasPaidPrice ? (
            <button type="submit" disabled={processing}
              className="w-full bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {processing ? 'Redirecting…' : `Pay A$${parseFloat(offer.price).toFixed(2)} securely`}
              {!processing && <span className="text-xs opacity-70">via Stripe</span>}
            </button>
          ) : (
            <button type="submit" disabled={processing}
              className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {processing ? 'Sending…' : 'Send request to host'}
            </button>
          )}
        </form>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Package() {
  const { pkg, branding, upsells = [], package_id, guest_email = '', guest_name = '', flash = {} } = usePage().props
const [showMaintenance, setShowMaintenance] = useState(false)

const { data, setData, post, processing } = useForm({
  title: '',
  description: '',
  priority: 'medium',
  category: '',
  location: '',
  guest_name: guest_name,
  guest_email: guest_email,
  guest_phone: '',
})
  const quick = pkg.quick || {}

  // ── State ──────────────────────────────────
  const [toast, setToast] = React.useState({ visible: false, message: '' })

  // Show toast on return from Stripe (upsell_paid / upsell_cancelled query params)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upsell_paid') === '1') {
      showToast('✅ Payment successful! Your host has been notified.')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('upsell_cancelled') === '1') {
      showToast('Payment cancelled.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])
  const [copiedKey, setCopiedKey] = React.useState(null)
  const [isOffline, setIsOffline] = React.useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )
  const [stickyBarVisible, setStickyBarVisible] = React.useState(false)

  // ── Refs ───────────────────────────────────
  const heroRef  = React.useRef(null)
  const engageRef = React.useRef({ token: null, queue: [], sectionTimers: {} })

  // ── Engagement tracking (Phase 2C) ─────────
  React.useEffect(() => {
    const eng = engageRef.current

    // Session token — unique per package per browser session
    const storageKey = `ef_${package_id}`
    let tok = null
    try {
      tok = sessionStorage.getItem(storageKey)
      if (!tok) {
        tok = Math.random().toString(36).slice(2) + Date.now().toString(36)
        sessionStorage.setItem(storageKey, tok)
      }
    } catch {
      tok = Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
    eng.token = tok

    // Queue the initial guide_open event
    eng.queue.push({ event_type: 'guide_open', welcome_section_id: null, duration_seconds: null })

    function flush() {
      // Finalise any in-progress section view timers
      Object.entries(eng.sectionTimers).forEach(([id, start]) => {
        const dur = Math.round((Date.now() - start) / 1000)
        if (dur >= 1) {
          eng.queue.push({
            event_type: 'section_view',
            welcome_section_id: parseInt(id, 10),
            duration_seconds: dur,
          })
        }
        delete eng.sectionTimers[id]
      })

      const events = eng.queue.splice(0)
      if (!events.length) return

      fetch('/engagement/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcome_package_id: package_id, session_token: tok, events }),
        keepalive: true,
      }).catch(() => {})
    }

    // IntersectionObserver — track which sections scroll into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.dataset.sectionId
        if (!id) return
        if (entry.isIntersecting) {
          eng.sectionTimers[id] = Date.now()
        } else if (eng.sectionTimers[id]) {
          const dur = Math.round((Date.now() - eng.sectionTimers[id]) / 1000)
          if (dur >= 1) {
            eng.queue.push({
              event_type: 'section_view',
              welcome_section_id: parseInt(id, 10),
              duration_seconds: dur,
            })
          }
          delete eng.sectionTimers[id]
        }
      })
    }, { threshold: 0.3 })

    document.querySelectorAll('[data-section-id]').forEach(el => observer.observe(el))

    // Flush on tab hide / page close (most reliable delivery point)
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Also flush after 4 s so guide_open reaches the server quickly
    const earlyFlush = setTimeout(flush, 4000)

    return () => {
      clearTimeout(earlyFlush)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [package_id])

  // Called by SectionCard when the accordion is opened
  function trackSectionExpand(sectionId) {
    const eng = engageRef.current
    if (!eng.token) return
    eng.queue.push({ event_type: 'section_expand', welcome_section_id: sectionId, duration_seconds: null })
  }

  // ── Offline detection ──────────────────────
  React.useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  // ── Sticky bar: IntersectionObserver on hero ──
  React.useEffect(() => {
    if (!heroRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyBarVisible(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Copy helper + toast ────────────────────
  async function handleCopy(text, key) {
    const ok = await copyText(text)
    if (ok) {
      setCopiedKey(key)
      showToast('Copied!')
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  function showToast(msg) {
    setToast({ visible: true, message: msg })
    setTimeout(() => setToast({ visible: false, message: '' }), 2000)
  }

  // ── Derived values ─────────────────────────
  const propertyTitle = pkg.title || ''
  const greeting = buildGreeting(pkg)
  const hostPhone = quick.host_phone || null
  const wifiName = quick.wifi_name || null
  const wifiPassword = quick.wifi_password || null
  const lockCode = quick.smart_lock_code || null
  const checkIn = quick.check_in_date || pkg.check_in_date || null
  const checkOut = quick.check_out_date || pkg.check_out_date || null

  const logoUrl = branding?.logo_url || null
  const displayName = branding?.display_name || null
  const contactLabel = branding?.contact_label || 'Call Host'

  const shareData = {
    title: propertyTitle,
    text: `Welcome to ${propertyTitle}!`,
    url: window.location.href,
  }

  const sections = Array.isArray(pkg.sections)
    ? [...pkg.sections].sort((a, b) => a.sort_order - b.sort_order)
    : []

  // ── Render ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head title={propertyTitle || 'Welcome Pack'} />

      {/* OFFLINE BANNER */}
      <OfflineBanner visible={isOffline} />

      {/* STICKY TOP BAR */}
      <StickyBar
        title={displayName || propertyTitle}
        phone={hostPhone}
        visible={stickyBarVisible}
      />

      {/* ── HERO ──────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative px-5 pt-8 pb-8 max-w-2xl mx-auto">
          {/* Top row: avatar + property name */}
          <div className="flex items-center gap-3 mb-6">
            <PropertyAvatar logoUrl={logoUrl} title={propertyTitle} />
            <div className="min-w-0">
              <p className="text-white/60 text-[11px] uppercase tracking-widest font-medium">Welcome to</p>
              <p className="text-white font-semibold text-sm leading-snug truncate">
                {displayName || propertyTitle || 'Your Stay'}
              </p>
            </div>
          </div>

          {/* Main greeting */}
          <h1 className="text-3xl font-bold text-white leading-tight mb-1 tracking-tight">
            {greeting}
          </h1>
          {pkg.address && (
            <p className="text-white/50 text-sm mt-1 mb-5 leading-snug">{pkg.address}</p>
          )}

          {/* Date pill + nights */}
          {(checkIn || checkOut) && (
            <div className="flex flex-wrap gap-2 items-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white/90">
                <Icons.calendar className="w-4 h-4 text-white/60" />
                {checkIn && <span>{fmt(checkIn)}</span>}
                {checkIn && checkOut && <span className="text-white/40">→</span>}
                {checkOut && <span>{fmt(checkOut)}</span>}
              </div>
              {checkIn && checkOut && (() => {
                const nights = Math.round((new Date(checkOut + 'T00:00:00') - new Date(checkIn + 'T00:00:00')) / 86400000)
                return nights > 0 ? (
                  <div className="inline-flex items-center bg-white/20 rounded-full px-3 py-1.5 text-xs font-semibold text-white">
                    {nights} night{nights !== 1 ? 's' : ''}
                  </div>
                ) : null
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────── */}
      <div className="px-4 max-w-2xl mx-auto pb-32">

        {/* ── QUICK TILES ── */}
        {(wifiName || lockCode || hostPhone || checkIn) && (
          <div className="-mx-4 px-4 mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Access</p>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>

              {/* Wi-Fi */}
              {wifiName && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.wifi}
                    label="Wi-Fi"
                    value={wifiPassword ? `${wifiName} · ${wifiPassword}` : wifiName}
                    copied={copiedKey === 'wifi'}
                    onTap={() =>
                      handleCopy(
                        wifiPassword ? `${wifiName}\n${wifiPassword}` : wifiName,
                        'wifi'
                      )
                    }
                  />
                  {wifiPassword && (
                    <div className="mt-1 px-1">
                      <button
                        onClick={() => handleCopy(wifiPassword, 'wifipass')}
                        className="text-[10px] text-emerald-600 font-medium flex items-center gap-1"
                      >
                        {copiedKey === 'wifipass' ? <Icons.check /> : <Icons.copy />}
                        {copiedKey === 'wifipass' ? 'Password copied' : 'Copy password only'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Smart Lock */}
              {lockCode && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.lock}
                    label="Smart Lock"
                    value={lockCode}
                    copied={copiedKey === 'lock'}
                    onTap={() => handleCopy(lockCode, 'lock')}
                  />
                </div>
              )}

              {/* Host Phone */}
              {hostPhone && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.phone}
                    label={contactLabel}
                    value={hostPhone}
                    href={`tel:${hostPhone}`}
                    copied={false}
                  />
                </div>
              )}

              {/* Check-in date tile */}
              {checkIn && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.calendar}
                    label="Check-In"
                    value={fmtFull(checkIn)}
                    copied={copiedKey === 'checkin'}
                    onTap={() => handleCopy(fmtFull(checkIn), 'checkin')}
                  />
                </div>
              )}

              {/* Check-out date tile */}
              {checkOut && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.calendar}
                    label="Check-Out"
                    value={fmtFull(checkOut)}
                    copied={copiedKey === 'checkout'}
                    onTap={() => handleCopy(fmtFull(checkOut), 'checkout')}
                  />
                </div>
              )}

              {/* Maps shortcut */}
              {pkg.address && (
                <div className="snap-start shrink-0">
                  <QuickTile
                    icon={Icons.map}
                    label="Directions"
                    value={pkg.address}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.address)}`}
                    copied={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTIONS ── */}
        <div className="mt-8">
          {sections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icons.guide className="text-gray-400 w-6 h-6" />
              </div>
              <p className="text-gray-700 font-semibold text-sm mb-1">Guide coming soon</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Your host is preparing your welcome guide — check back soon.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Guide</p>
              <div className="grid gap-3">
                {sections.map((s, i) => (
                  <SectionCard key={s.id || i} section={s} defaultOpen={i === 0} onExpand={trackSectionExpand} />
                ))}
              </div>
            </>
          )}
        </div>

{/* ── GUEST MAINTENANCE ── */}
<div className="mt-10">
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <p className="font-semibold text-gray-800 mb-2">Need help during your stay?</p>
    <p className="text-sm text-gray-500 mb-4">
      Report any issues and your host will be notified immediately.
    </p>

    <button
      onClick={() => setShowMaintenance(!showMaintenance)}
      className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
    >
      {showMaintenance ? 'Cancel' : 'Report an Issue'}
    </button>
  </div>
</div>

{showMaintenance && (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      const slug = window.location.pathname.split('/').pop()
      post(`/p/${slug}/maintenance`)
    }}
    className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 space-y-3"
  >
    <input
      placeholder="Issue title"
      value={data.title}
      onChange={(e) => setData('title', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
      required
    />

    <textarea
      placeholder="Describe the issue"
      value={data.description}
      onChange={(e) => setData('description', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
      rows={3}
      required
    />

    <select
      value={data.priority}
      onChange={(e) => setData('priority', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>

    <input
      placeholder="Location (e.g. kitchen, bathroom)"
      value={data.location}
      onChange={(e) => setData('location', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
    />

    <input
      placeholder="Your name"
      value={data.guest_name}
      onChange={(e) => setData('guest_name', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
    />

    <input
      type="email"
      placeholder="Your email"
      value={data.guest_email}
      onChange={(e) => setData('guest_email', e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm"
      required
    />

    <button
      type="submit"
      disabled={processing}
      className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold"
    >
      {processing ? 'Sending...' : 'Submit Issue'}
    </button>
  </form>
)}

        {/* ── UPSELLS ── */}
        {upsells.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Add-ons & Extras</p>
            {flash.upsell_success && (
              <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                {flash.upsell_success}
              </div>
            )}
            <div className="grid gap-3">
              {upsells.map(o => (
                <UpsellCard key={o.id} offer={o} packageId={package_id} guestEmail={guest_email} guestName={guest_name} />
              ))}
            </div>
          </div>
        )}

        {/* ── SHARE ROW ── */}
        <div className="mt-8 flex gap-3">
          {pkg.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-50 text-indigo-700 text-sm font-semibold active:bg-indigo-100 transition-colors"
            >
              <Icons.map />
              Directions
            </a>
          )}
          <button
            onClick={async () => {
              if (navigator.share) {
                try { await navigator.share(shareData); return } catch {}
              }
              const ok = await copyText(window.location.href)
              if (ok) showToast('Link copied!')
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold active:bg-gray-200 transition-colors"
          >
            <Icons.share />
            Share
          </button>
        </div>

      </div>{/* end main content */}

      {/* ── FOOTER ── */}
      <div className="max-w-2xl mx-auto px-4 pb-8 text-center">
        <p className="text-gray-400 text-[11px]">
          Powered by{' '}
          <a
            href="https://hostflows.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            HostFlows
          </a>
        </p>
      </div>

      {/* ── TOAST ── */}
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  )
}
