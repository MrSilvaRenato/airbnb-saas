import React from "react";
import { Link } from "@inertiajs/react";

export default function Expired({ status = 419, message = "Your session has expired. Please sign in again." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white border shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <span className="text-xl font-semibold">419</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Session expired</h1>
        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={route('login')} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900">
            Sign in
          </Link>
          <button onClick={() => location.reload()} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100">
            Refresh
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">Error {status}</p>
      </div>
    </div>
  );
}
