import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";


function AuthModal({ mode, setMode, loginForm, registerForm, submitLogin, submitRegister }) {
  if (!mode) return null
  const isLogin = mode === 'login'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-sm"
          onClick={() => setMode(null)}
        >
          ✕
        </button>

        {isLogin ? (
          <>
            <h2 className="text-lg font-semibold mb-1">Log in</h2>
            <p className="text-xs text-gray-500 mb-4">
              Access your host dashboard.
            </p>

            <form onSubmit={submitLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={loginForm.data.email}
                  onChange={(e) => loginForm.setData('email', e.target.value)}
                  required
                />
                {loginForm.errors.email && (
                  <p className="text-xs text-red-600">{loginForm.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={loginForm.data.password}
                  onChange={(e) => loginForm.setData('password', e.target.value)}
                  required
                />
                {loginForm.errors.password && (
                  <p className="text-xs text-red-600">{loginForm.errors.password}</p>
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={loginForm.data.remember}
                  onChange={(e) =>
                    loginForm.setData('remember', e.target.checked)
                  }
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={loginForm.processing}
                className="w-full flex justify-center px-4 py-2 rounded-lg bg-black text-white text-sm"
              >
                {loginForm.processing ? 'Logging in…' : 'Log in'}
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-full text-xs text-gray-500 underline text-center"
              >
                Need an account? Register
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-1">Create your free account</h2>
            <p className="text-xs text-gray-500 mb-4">
              Get your first property live in minutes.
            </p>

            <form onSubmit={submitRegister} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your name
                </label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registerForm.data.name}
                  onChange={(e) =>
                    registerForm.setData('name', e.target.value)
                  }
                  required
                />
                {registerForm.errors.name && (
                  <p className="text-xs text-red-600">{registerForm.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registerForm.data.email}
                  onChange={(e) =>
                    registerForm.setData('email', e.target.value)
                  }
                  required
                />
                {registerForm.errors.email && (
                  <p className="text-xs text-red-600">{registerForm.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registerForm.data.password}
                  onChange={(e) =>
                    registerForm.setData('password', e.target.value)
                  }
                  required
                />
                {registerForm.errors.password && (
                  <p className="text-xs text-red-600">{registerForm.errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registerForm.data.password_confirmation}
                  onChange={(e) =>
                    registerForm.setData('password_confirmation', e.target.value)
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={registerForm.processing}
                className="w-full flex justify-center px-4 py-2 rounded-lg bg-black text-white text-sm"
              >
                {registerForm.processing ? 'Creating…' : 'Create account'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-xs text-gray-500 underline text-center"
              >
                Already have an account? Log in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}



export default function Landing() {
  
  const [mode, setMode] = useState(null) // 'login' | 'register' | null
  // login form
  const loginForm = useForm({
    email: '',
    password: '',
    remember: false,
  })
  
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("login") === "1") setMode("login");       // 👈 correct setter
    if (p.get("register") === "1") setMode("register"); // 👈 correct setter
  }, []);

  const submitLogin = (e) => {
    e.preventDefault()
    loginForm.post(route('login'), {
      onSuccess: () => {
        loginForm.reset('password')
        setMode(null)
      },
    })
  }

  // register form
  const registerForm = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const submitRegister = (e) => {
    e.preventDefault()
    registerForm.post(route('register'), {
      onSuccess: () => {
        registerForm.reset('password', 'password_confirmation')
        setMode(null)
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Head title="Welcome Pack for Modern Hosts" />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Everything your guest needs — in one link. TESTING PUSH GIT
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Create a personalised digital welcome guide for every stay — with check-in info, Wi-Fi, house rules, and local tips. Share it instantly via WhatsApp or QR code.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setMode('register')}
              className="px-6 py-3 bg-black text-white rounded-lg text-base font-medium hover:bg-gray-800 transition"
            >
              Start Free
            </button>

            <button
              onClick={() => setMode('login')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium hover:bg-gray-50 transition"
            >
              Log in
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Made for Airbnb hosts, boutique hotels, and short-stay managers.
          </p>
          {window.Laravel?.user && window.Laravel.user.plan === "free" && (
  <div className="mt-4">
    <a
      href={route("checkout.show")}
      className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
    >
      Upgrade to Pro
    </a>
  </div>
)}
        </div>

        <div className="mt-10 md:mt-0 md:ml-12">
          <img
            src="/Images/2.png"
            alt="Guest Welcome App"
            className="w-[320px] md:w-[420px] rounded-xl shadow-xl"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="font-semibold mb-2">Add Your Property</h3>
              <p className="text-gray-600 text-sm">
                Create a property once — address, Wi-Fi details, notes — ready for every new guest.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">🗓️</div>
              <h3 className="font-semibold mb-2">Create a Stay</h3>
              <p className="text-gray-600 text-sm">
                Enter guest name and dates. The system builds their personalised welcome guide instantly.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Share in One Tap</h3>
              <p className="text-gray-600 text-sm">
                Send the link or QR via WhatsApp, email, or print it for your fridge magnet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">Why Hosts Love It</h2>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-semibold mb-2">Fewer Questions, Happier Guests</h3>
            <p className="text-gray-600 mb-6 text-sm">
              No more midnight messages asking for Wi-Fi codes or where to park. Guests get answers instantly.
            </p>

            <h3 className="font-semibold mb-2">Professional Experience</h3>
            <p className="text-gray-600 text-sm">
              Impress your guests with a clean, mobile-friendly digital guide that reflects your brand.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Share via WhatsApp, SMS, or QR. Perfect for cleaners and co-hosts too.
            </p>

            <h3 className="font-semibold mb-2">Stay History</h3>
            <p className="text-gray-600 text-sm">
              Keep track of guests and dates for better organisation and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Local Reference Section */}
      <section className="bg-emerald-50 py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Help Guests Discover Local Experiences</h2>
          <p className="text-gray-700 mb-8">
            Showcase local restaurants, tours, and services directly in your guide — supporting small businesses and delighting your guests.
          </p>

          <img
            src="Images/3.png"
            alt="Local experiences"
            className="w-[300px] md:w-[450px] mx-auto rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg italic text-gray-700 mb-3">
            “Our guests stopped calling us at midnight for Wi-Fi or parking instructions.”
          </p>
          <p className="font-semibold text-gray-800">– Sarah M., Property Manager, Gold Coast</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Ready to stop answering the same question six times a night?
        </h2>

        <button
          onClick={() => setMode('register')}
          className="px-8 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition"
        >
          Get Started – It’s Free
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-500">
        <div className="space-x-4">
          <button
            onClick={() => setMode('login')}
            className="hover:text-gray-800 underline"
          >
            Login
          </button>
          <a href="/terms" className="hover:text-gray-800">Terms</a>
          <a href="/privacy" className="hover:text-gray-800">Privacy</a>
          <a href="/contact" className="hover:text-gray-800">Contact</a>
        </div>

        <p className="mt-4">
          © {new Date().getFullYear()} WelcomePack. All rights reserved.
        </p>
      </footer>

      {/* Auth modal (stable component now, no focus loss) */}
      <AuthModal
        mode={mode}
        setMode={setMode}
        loginForm={loginForm}
        registerForm={registerForm}
        submitLogin={submitLogin}
        submitRegister={submitRegister}
      />
    </div>
  )
}
