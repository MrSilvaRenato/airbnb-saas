import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import Toast from '@/Components/Toast'

function NavLink({ href, children }) {
  const isActive = route().current(href.replace(/^\//,'') + '*') || route().current(href)
  return (
    <Link href={href} className={`px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
      {children}
    </Link>
  )
}

export default function Shell({ title, children, right = null }) {
  const { auth } = usePage().props
  const user = auth?.user
  const { impersonating } = usePage().props;
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
  return (  
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('host.dashboard')} className="font-semibold tracking-tight">AirBnB SaaS</Link>
            <div className="hidden sm:flex items-center gap-1">
              {user && (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/host/dashboard">Host</NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {right}
            {user ? (
              <Link href={route('logout')} method="post" as="button" className="px-3 py-1.5 rounded-lg border">
                Logout
              </Link>
            ) : (
              <>
                <Link className="px-3 py-1.5 rounded-lg border" href={route('login')}>Login</Link>
                <Link className="px-3 py-1.5 rounded-lg bg-black text-white" href={route('register')}>Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      {/* Mobile bottom bar */}
      {user && (
        <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-full shadow-lg bg-white border flex gap-2">
          <Link href="/host/dashboard" className="px-3 py-1.5 rounded-lg text-sm bg-gray-100">Host</Link>
          <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm">Dashboard</Link>
        </div>
      )}

      <Toast />
    </div>
  )
}
