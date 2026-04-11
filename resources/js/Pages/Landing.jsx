import React, { useState, useEffect, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import ChatWidget from "../Components/ChatWidget.jsx";

/* ── AUTH MODAL (unchanged logic) ─────────────────────────────── */
function AuthModal({ mode, setMode, loginForm, registerForm, submitLogin, submitRegister }) {
  if (!mode) return null
  const isLogin = mode === 'login'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-7 relative">
        <button className="absolute top-4 right-4 text-gray-300 hover:text-black" onClick={() => setMode(null)}>✕</button>
        {isLogin ? (
          <>
            <h2 className="text-xl font-bold mb-1">Welcome back</h2>
            <p className="text-xs text-gray-400 mb-5">Sign in to your dashboard</p>
            <form onSubmit={submitLogin} className="space-y-3">
              <input type="email" placeholder="Email" className="w-full border rounded-xl p-2.5 text-sm" value={loginForm.data.email} onChange={e => loginForm.setData('email', e.target.value)} required />
              {loginForm.errors.email && <p className="text-xs text-red-500">{loginForm.errors.email}</p>}
              <input type="password" placeholder="Password" className="w-full border rounded-xl p-2.5 text-sm" value={loginForm.data.password} onChange={e => loginForm.setData('password', e.target.value)} required />
              {loginForm.errors.password && <p className="text-xs text-red-500">{loginForm.errors.password}</p>}
              <button disabled={loginForm.processing} className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black">
                {loginForm.processing ? 'Signing in…' : 'Sign in'}
              </button>
              <button type="button" onClick={() => setMode('register')} className="w-full text-xs text-gray-400 hover:text-gray-700 text-center">No account? Sign up free →</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-1">Start for free</h2>
            <p className="text-xs text-gray-400 mb-5">No credit card required</p>
            <form onSubmit={submitRegister} className="space-y-3">
              <input placeholder="Your name" className="w-full border rounded-xl p-2.5 text-sm" value={registerForm.data.name} onChange={e => registerForm.setData('name', e.target.value)} required />
              {registerForm.errors.name && <p className="text-xs text-red-500">{registerForm.errors.name}</p>}
              <input type="email" placeholder="Email" className="w-full border rounded-xl p-2.5 text-sm" value={registerForm.data.email} onChange={e => registerForm.setData('email', e.target.value)} required />
              {registerForm.errors.email && <p className="text-xs text-red-500">{registerForm.errors.email}</p>}
              <input type="password" placeholder="Password" className="w-full border rounded-xl p-2.5 text-sm" value={registerForm.data.password} onChange={e => registerForm.setData('password', e.target.value)} required />
              <input type="password" placeholder="Confirm password" className="w-full border rounded-xl p-2.5 text-sm" value={registerForm.data.password_confirmation} onChange={e => registerForm.setData('password_confirmation', e.target.value)} required />
              {registerForm.errors.password && <p className="text-xs text-red-500">{registerForm.errors.password}</p>}
              <button disabled={registerForm.processing} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                {registerForm.processing ? 'Creating account…' : 'Create free account'}
              </button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-xs text-gray-400 hover:text-gray-700 text-center">Already have an account? Sign in →</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ── ANIMATED COUNTER ─────────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = Math.ceil(to / 40)
      const t = setInterval(() => {
        start = Math.min(start + step, to)
        setVal(start)
        if (start >= to) clearInterval(t)
      }, 30)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── FEATURE CARD ─────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-xl ${color}`}>{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

/* ── PRICING CARD ─────────────────────────────────────────────── */
function PricingCard({ name, price, desc, features, cta, highlight, onCta }) {
  return (
    <div className={`rounded-2xl p-7 flex flex-col relative ${highlight ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white border border-gray-200 shadow-sm'}`}>
      {highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
      <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${highlight ? 'text-indigo-200' : 'text-indigo-600'}`}>{name}</div>
      <div className="mb-1">
        <span className="text-4xl font-bold">${price}</span>
        {price > 0 && <span className={`text-sm ml-1 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>/month</span>}
      </div>
      <p className={`text-sm mb-6 ${highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{desc}</p>
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={highlight ? 'text-indigo-300' : 'text-emerald-500'}>✓</span>
            <span className={highlight ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={onCta} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${highlight ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{cta}</button>
    </div>
  )
}

/* ── MAIN ─────────────────────────────────────────────────────── */
export default function Landing() {
  const [mode, setMode] = useState(null)

  const loginForm = useForm({ email: '', password: '', remember: false })
  const registerForm = useForm({ name: '', email: '', password: '', password_confirmation: '' })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('login') === '1') setMode('login')
    if (p.get('register') === '1') setMode('register')
  }, [])

  const submitLogin = e => { e.preventDefault(); loginForm.post(route('login'), { onSuccess: () => { loginForm.reset('password'); setMode(null) } }) }
  const submitRegister = e => { e.preventDefault(); registerForm.post(route('register'), { onSuccess: () => { registerForm.reset('password', 'password_confirmation'); setMode(null) } }) }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Head title="HostFlows — Property Management Platform for Short-Stay Hosts" />

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight">HostFlows</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('login')} className="text-sm text-gray-600 hover:text-black px-3 py-1.5">Sign in</button>
            <button onClick={() => setMode('register')} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Start free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-200 mb-6">
              🏆 Built for property managers & real estate agents
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
              Manage every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">property. Every stay.</span><br />
              One platform.
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-xl leading-relaxed">
              Digital welcome packages, occupancy calendars, maintenance tracking, revenue analytics, and automated guest communication — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button onClick={() => setMode('register')} className="px-7 py-3.5 bg-white text-indigo-700 rounded-xl font-bold text-base hover:bg-indigo-50 transition-all shadow-lg">
                Start for free →
              </button>
              <button onClick={() => setMode('login')} className="px-7 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-all">
                Sign in
              </button>
            </div>
            <p className="text-indigo-400 text-xs mt-4">Free forever · No credit card · Live in 5 minutes</p>
          </div>

          {/* Dashboard preview mockup */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-2xl">
              {/* Fake dashboard header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold text-sm">Occupancy Timeline</span>
                <span className="text-indigo-300 text-xs">May 2026 · 38 stays</span>
              </div>
              {/* Fake Gantt rows */}
              {[
                { name: 'Bowen Hills Apt', w1: 3, s1: 0, w2: 5, s2: 5, c1: 'bg-indigo-400', c2: 'bg-violet-400' },
                { name: 'New Farm Studio', w1: 4, s1: 2, w2: 3, s2: 8, c1: 'bg-emerald-400', c2: 'bg-teal-400' },
                { name: 'West End House',  w1: 6, s1: 0, w2: 2, s2: 9, c1: 'bg-amber-400',  c2: 'bg-orange-400' },
                { name: 'South Bank Apt',  w1: 3, s1: 3, w2: 4, s2: 7, c1: 'bg-rose-400',   c2: 'bg-pink-400' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="text-white/60 text-[10px] w-24 truncate shrink-0">{r.name}</span>
                  <div className="flex-1 relative h-6">
                    <div className={`absolute top-1 h-4 rounded-full ${r.c1} opacity-90`} style={{ left: `${r.s1 * 8}%`, width: `${r.w1 * 8}%` }} />
                    <div className={`absolute top-1 h-4 rounded-full ${r.c2} opacity-90`} style={{ left: `${r.s2 * 8}%`, width: `${r.w2 * 8}%` }} />
                  </div>
                </div>
              ))}
              {/* Fake KPI row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[['38', 'Stays'], ['$18.4k', 'Revenue'], ['87%', 'Occupancy']].map(([v, l]) => (
                  <div key={l} className="bg-white/10 rounded-xl p-2.5 text-center">
                    <div className="text-white font-bold text-base">{v}</div>
                    <div className="text-indigo-300 text-[10px]">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { to: 500, suffix: '+', label: 'Properties managed' },
            { to: 2800, suffix: '+', label: 'Stays created' },
            { to: 98, suffix: '%', label: 'Guest satisfaction' },
            { to: 3, suffix: ' min', label: 'Setup time' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-indigo-700 mb-1"><Counter to={s.to} suffix={s.suffix} /></div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to run at scale</h2>
          <p className="text-gray-500 max-w-xl mx-auto">From your first property to a full portfolio — HostFlows grows with you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon="🏠" color="bg-indigo-50" title="Multi-Property Management" desc="Add unlimited properties with default Wi-Fi, smart lock codes, house rules, and arrival instructions. One setup, every stay." />
          <FeatureCard icon="📋" color="bg-violet-50" title="Occupancy Timeline (Gantt)" desc="See all properties and stays on a single timeline. Instantly spot gaps, back-to-back stays, and availability — like a pro." />
          <FeatureCard icon="📱" color="bg-emerald-50" title="Digital Welcome Packages" desc="Guests get a beautiful mobile page with Wi-Fi, lock codes, house rules, local tips, and check-in instructions. Branded to you." />
          <FeatureCard icon="📊" color="bg-amber-50" title="Revenue & Analytics" desc="Track revenue per property, occupancy rates, guest visit counts, and monthly trends. Know your numbers instantly." />
          <FeatureCard icon="🔧" color="bg-rose-50" title="Maintenance Tracking" desc="Log and manage repairs with priority levels and status columns. Never lose track of what needs fixing across your portfolio." />
          <FeatureCard icon="✉️" color="bg-teal-50" title="Automated Guest Emails" desc="Guests automatically receive their welcome link on check-in day. Set it once, forget it — it just works." />
          <FeatureCard icon="🎨" color="bg-orange-50" title="Custom Branding" desc="Add your logo, display name, and contact label. Your guests see your brand, not ours." />
          <FeatureCard icon="📅" color="bg-sky-50" title="Stay History & Export" desc="Full stay history across all properties. Export to CSV for accounting, compliance, or your own analysis." />
          <FeatureCard icon="🔔" color="bg-pink-50" title="Guest View Notifications" desc="Get notified the moment a guest opens their welcome page. Know they've checked in before they even knock." />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Up and running in minutes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: '🏠', title: 'Add your property', desc: 'Enter address, Wi-Fi, lock code, and house rules once. Reused for every stay automatically.' },
              { n: '02', icon: '🗓️', title: 'Create a stay', desc: 'Add guest name, email, and dates. A personalised welcome package is created instantly.' },
              { n: '03', icon: '📲', title: 'Share with one tap', desc: 'Send via WhatsApp, email, or QR code. Guests get everything they need on their phone.' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm text-left">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{s.n}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-20 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Hosts and managers love it</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { q: '"Our guests stopped calling us at midnight for Wi-Fi codes. HostFlows paid for itself in week one."', name: 'Sarah M.', role: 'Property Manager · Gold Coast' },
            { q: '"I manage 12 properties and the Gantt calendar alone is worth it. I can see everything at a glance."', name: 'James T.', role: 'Real Estate Investor · Brisbane' },
            { q: '"The automated welcome emails are incredible. Guests always say how professional we are."', name: 'Renata L.', role: 'Short-Stay Host · Melbourne' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed italic mb-4">"{t.q}"</p>
              <div>
                <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-500 mb-12">Start free. Upgrade when you're ready. Cancel any time.</p>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <PricingCard name="Starter" price={0} desc="Perfect for getting started" features={['1 property','1 active stay','Guest welcome page + QR','Wi-Fi, lock code, house rules']} cta="Start free" onCta={() => setMode('register')} />
            <PricingCard name="Host" price={19} desc="For serious hosts" features={['Up to 5 properties','Unlimited stays','Custom branding','Basic analytics']} cta="Get started" highlight onCta={() => setMode('register')} />
            <PricingCard name="Pro" price={49} desc="For agencies & managers" features={['Unlimited properties','Full analytics + revenue','Maintenance tracking','Guest auto-email','CSV export','Priority support']} cta="Go Pro" onCta={() => setMode('register')} />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 to-violet-900 text-white py-24 px-5 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-400/10 rounded-full" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Your portfolio deserves better tools.</h2>
          <p className="text-indigo-300 mb-8 text-lg">Join hundreds of hosts and property managers who run smarter with HostFlows.</p>
          <button onClick={() => setMode('register')} className="px-10 py-4 bg-white text-indigo-700 rounded-xl font-bold text-base hover:bg-indigo-50 transition-all shadow-xl">
            Start for free — no card needed
          </button>
          <ChatWidget />
        </div>
        
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="font-bold text-white text-base">HostFlows</div>
          <div className="flex gap-5">
            <button onClick={() => setMode('login')} className="hover:text-white transition-colors">Login</button>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} HostFlows. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal mode={mode} setMode={setMode} loginForm={loginForm} registerForm={registerForm} submitLogin={submitLogin} submitRegister={submitRegister} />
    </div>
  )
}
