import React from 'react'
import { Link, useForm, usePage } from '@inertiajs/react'

export default function Welcome({ canLogin = true, canRegister = true }) {
  const { auth } = usePage().props // Breeze shares auth.user
  const user = auth?.user ?? null

  // Inline login form (for guests)
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  })
  const submit = (e) => {
    e.preventDefault()
    post(route('login'), {
      onSuccess: () => reset('password'),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AirBnB SaaS Dashboard</h1>
          <p className="text-gray-600">
            Create interactive Welcome Packages: Wi-Fi, check-out, house rules and local tips via QR code.
          </p>
        </div>

        {user ? (
          // AUTHENTICATED VIEW
          <div className="flex items-center justify-center gap-3">
            <Link href={route('dashboard')} className="px-4 py-2 rounded-lg bg-black text-white">
              Go to Dashboard
            </Link>
          <form method="post" action={route('logout')}>
  <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')} />
  <button
    type="submit"
    className="px-4 py-2 rounded-lg border"
  >
    Logout
  </button>
</form>
          </div>
        ) : (
          // GUEST VIEW (INLINE LOGIN)
          <div className="rounded-2xl border p-4">
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-2"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  autoComplete="username"
                  required
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-2"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  autoComplete="current-password"
                  required
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                />
                Remember me
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-black text-white"
                >
                  Log in
                </button>

                {canRegister && (
                  <Link href={route('register')} className="px-4 py-2 rounded-lg border">
                    Register
                  </Link>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
