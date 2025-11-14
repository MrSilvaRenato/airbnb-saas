import React from "react";
import { Link } from "@inertiajs/react";

export default function ServerError({ status = 500, message = "Something went wrong." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white border shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <span className="text-xl font-semibold">500</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">We hit a snag</h1>
        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => location.reload()} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100">
            Try again
          </button>
          <Link href="/" className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900">
            Go home
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-400">Error {status}</p>
      </div>
    </div>
  );
}
