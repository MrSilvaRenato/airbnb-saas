import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function Success({ plan, message }) {
  const isPro = plan === "pro";

  return (
    <>
      <Head title="Payment complete" />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white shadow border p-6 text-center">
          {/* Badge */}
          <div
            className={
              "inline-block rounded-full px-3 py-1 text-xs font-medium mb-4 " +
              (isPro
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-yellow-100 text-yellow-700 border border-yellow-200")
            }
          >
            {isPro ? "You're on Pro ✅" : "Payment processing…"}
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900">
            {isPro ? "Upgrade successful" : "Thanks!"}
          </h1>

          {/* Body copy */}
          <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
            {message ||
              (isPro
                ? "Branding & unlimited stays are now unlocked."
                : "We're finalizing your upgrade.")}
          </p>

          {/* Little explainer */}
          <div className="text-[12px] text-gray-500 mt-4 leading-relaxed">
            <p>
              You can close this tab and go back to your dashboard. If your plan
              still shows as Free, give it a second and refresh — it updates as
              soon as we confirm your subscription.
            </p>
          </div>

          {/* CTA back to dashboard */}
          <Link
            href={route("host.dashboard")}
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-black text-white text-sm font-medium px-4 py-2 hover:bg-gray-800"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
