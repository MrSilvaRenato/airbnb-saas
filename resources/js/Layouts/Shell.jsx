import React from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import Toast from '@/Components/Toast'

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
  const { auth, impersonating, unreadVisits = 0 } = usePage().props
  const user = auth?.user

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
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="px-3 py-1.5 rounded-lg border"
              >
                Logout
              </Link>
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
        <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-full shadow-lg bg-white border flex gap-2">
          <Link href="/host/dashboard" className="px-3 py-1.5 rounded-lg text-sm bg-gray-100">
            Dashboard
          </Link>
          <Link href="/host/calendar" className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
            </svg>
            Calendar
          </Link>
          <Link href="/host/analytics" className="px-3 py-1.5 rounded-lg text-sm">
            Analytics
          </Link>
          <Link href="/billing/manage" className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Billing
          </Link>
        </div>
      )}

      <Toast />
    </div>
  )
}