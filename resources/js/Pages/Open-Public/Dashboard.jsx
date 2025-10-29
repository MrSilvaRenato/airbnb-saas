import React from 'react'
import { Link } from '@inertiajs/react'

export default function Welcome({ canLogin = true, canRegister = true }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold">AirBnB SaaS Dashboard</h1>
        <p className="text-gray-600">
          Create interactive Welcome Packages for your guests: Wi-Fi, check-out, house rules,
          and local tips — all accessible via QR code.
        </p>
        <div className="flex items-center justify-center gap-3">
          {canLogin && <Link href={route('login')} className="px-4 py-2 rounded-lg bg-black text-white">Log in</Link>}
          {canRegister && <Link href={route('register')} className="px-4 py-2 rounded-lg border">Register</Link>}
        </div>
      </div>
    </div>
  )
}
