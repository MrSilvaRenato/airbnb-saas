import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function Cancel({ message }) {
  return (
    <>
      <Head title="Upgrade canceled" />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white shadow border p-6 text-center">
          <div className="inline-block rounded-full px-3 py-1 text-xs font-medium mb-4 bg-red-100 text-red-700 border border-red-200">
            Not upgraded
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Maybe later 👌
          </h1>

          <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
            {message ||
              "You're still on the Free plan. You can upgrade any time from your dashboard."}
          </p>

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
