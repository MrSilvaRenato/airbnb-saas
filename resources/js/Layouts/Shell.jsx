import React, { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import Toast from '@/Components/Toast'
import ChatWidget from '@/Components/ChatWidget'

function NavLink({ href, children }) {
  const isActive = route().current(href.replace(/^\//,'') + '*') || route().current(href)

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm ${
        isActive
          ? 'bg-gray-100 font-medium'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Shell({ title, children, right = null }) {
  const page = usePage()
  const { auth, impersonating, unreadVisits = 0 } = page.props
  const currentUrl = page.url
  const user = auth?.user
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isActive = (path) => (currentUrl || '').startsWith(path)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ Impersonation Banner */}
      {impersonating && (
        <div className="bg-yellow-400 text-yellow-900 text-sm font-medium px-4 py-2 flex items-center justify-between">
          <span>⚠️ You are viewing as another user</span>
          <button
            onClick={() => router.post(route('admin.stop.impersonating'))}
            className="px-3 py-1 rounded bg-yellow-900 text-yellow-100 text-xs font-medium hover:bg-yellow-800"
          >
            Stop & return to Admin
          </button>
        </div>
      )}

      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link href={route('host.dashboard')} className="font-semibold tracking-tight">
              HostFlows
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {user && (
                <>
                  <NavLink href="/host/dashboard">
                    <span className="flex items-center gap-1">
                      Dashboard
                      {unreadVisits > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
                          {unreadVisits > 9 ? '9+' : unreadVisits}
                        </span>
                      )}
                    </span>
                  </NavLink>
<NavLink href={route('profile.edit')}>
  <span className="flex items-center gap-1">
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
    Profile
  </span>
</NavLink>          
                  <NavLink href="/host/calendar">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                      </svg>
                      Calendar
                    </span>
                  </NavLink>
                  <NavLink href="/host/analytics">Analytics</NavLink>
                  {user.plan === 'pro' && <NavLink href="/host/maintenance">Maintenance</NavLink>}
                  <NavLink href="/billing/manage">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Billing
                    </span>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {right}

            {user ? (
              <div className="relative group">
                <Link href={route('profile.show')} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition">
                  {user.profile_photo
                    ? <img src={user.profile_photo} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-100" />
                    : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">{user.name?.[0]?.toUpperCase()}</div>
                  }
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </Link>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href={route('profile.show')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    My Profile
                  </Link>
                  <Link href={route('profile.edit')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                    Edit Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>
                    Logout
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link className="px-3 py-1.5 rounded-lg border" href={route('login')}>
                  Login
                </Link>
                <Link className="px-3 py-1.5 rounded-lg bg-black text-white" href={route('register')}>
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile bottom bar */}
      {user && (
        <>
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex">
            {[
              { href: '/host/dashboard', label: 'Home', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L22.5 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
              { href: '/host/calendar', label: 'Calendar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> },
              { href: '/host/analytics', label: 'Analytics', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> },
            ].map(tab => (
              <Link key={tab.href} href={tab.href} className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium ${isActive(tab.href) ? 'text-indigo-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{tab.icon}</svg>
                {tab.label}
              </Link>
            ))}
            <button onClick={() => setDrawerOpen(true)} className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              More
            </button>
          </div>

          {/* Slide-up drawer */}
          {drawerOpen && (
            <>
              <div className="sm:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
              <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-4 pb-10">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <nav className="space-y-1">
                  {user.plan === 'pro' && <Link href="/host/maintenance" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium">🔧 Maintenance</Link>}
                  <Link href="/billing/manage" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium">💳 Billing</Link>
                  <Link href={route('profile.show')} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium">👤 Profile</Link>
                  <a href={route('export.stays')} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium">⬇️ Export Stays</a>
                  <Link href={route('logout')} method="post" as="button" className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-red-500">🚪 Logout</Link>
                </nav>
              </div>
            </>
          )}

          {/* Spacer so content isn't hidden behind bottom bar */}
          <div className="sm:hidden h-16" />
        </>
      )}

      <Toast />
      <ChatWidget authUser={user} />
    </div>
  )
}
