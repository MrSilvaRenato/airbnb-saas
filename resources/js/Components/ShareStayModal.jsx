import React from "react";

export default function ShareStayModal({ pkg, propertyTitle, onClose }) {
  // Build important derived data
  const publicUrl = route("public.package", pkg.slug); // /p/{slug}

  // Days until check-in (for message tone)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = pkg.check_in_date
    ? new Date(pkg.check_in_date + "T00:00:00")
    : null;

  let daysUntil = null;
  if (start) {
    const diffMs = start - today;
    daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  function arrivalLine() {
    if (daysUntil === null) return "";
    if (daysUntil === 0) return "Your check-in is today.";
    if (daysUntil === 1) return "Your check-in is in 1 day.";
    if (daysUntil > 1) return `Your check-in is in ${daysUntil} days.`;
    // negative means already started
    return "You're already checked in 🎉";
  }

  const guestName = pkg.guest_first_name || "there";

  // Message body used for WhatsApp / email
  const baseMessage =
    `Hi ${guestName}!\n\n` +
    `Welcome to ${propertyTitle}.\n` +
    (arrivalLine() ? arrivalLine() + "\n\n" : "") +
    `Your digital welcome guide is here:\n${publicUrl}\n\n` +
    `It has check-in steps, Wi-Fi, house rules, local tips, and my contact.\n` +
    `Safe travels!`;

  // WhatsApp deep link:
  // 1. try to use guest_phone if we have it
  // 2. else fallback to generic share link
  const rawPhone = pkg.guest_phone || "";
  // Strip spaces, dashes etc. Keep + for now, then remove leading + for wa.me.
  const phoneDigits = rawPhone.replace(/[^\d+]/g, ""); // "+61 400-000-111" -> "+61400000111"
  const waTargetNumber = phoneDigits.replace(/^\+/, ""); // "61400000111"

  const waText = encodeURIComponent(baseMessage);

  const whatsappHref = waTargetNumber
    ? `https://wa.me/${waTargetNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  // Copy link handler
  async function doCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      alert("Link copied");
    } catch {
      alert("Could not copy, please copy manually.");
    }
  }

  // Download QR
  // We already generated and stored svg at qr_code_path, e.g. "qrcodes/slug.svg"
  const qrHref = pkg.qr_code_path
    ? `/storage/${pkg.qr_code_path}`
    : null;

  // Open mailto draft
  const emailSub = encodeURIComponent(`Welcome info for ${propertyTitle}`);
  const emailBody = encodeURIComponent(baseMessage);
  const emailTo = encodeURIComponent(pkg.guest_email || "");

  const mailtoHref = `mailto:${emailTo}?subject=${emailSub}&body=${emailBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* header */}
        <div className="flex items-start justify-between px-4 py-3 border-b">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              Share Welcome Package
            </div>
            <div className="text-xs text-gray-500 truncate">
              {pkg.guest_first_name
                ? `${pkg.guest_first_name} (${pkg.guest_count || "?"})`
                : "Guest"}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {propertyTitle}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-4 py-4 space-y-4 text-sm">
          {/* QR block */}
          <div className="rounded-xl border bg-gray-50 flex flex-col items-center p-4 text-center">
            {qrHref ? (
              <img
                src={qrHref}
                alt="QR code"
                className="w-32 h-32 object-contain bg-white border rounded"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center text-xs text-gray-400 bg-white border rounded">
                No QR
              </div>
            )}

            <div className="text-[11px] text-gray-500 mt-2">
              Guest scans this QR to open their guide
            </div>

            {qrHref && (
              <a
                href={qrHref}
                download
                className="mt-2 text-[12px] underline text-gray-600"
              >
                Download QR
              </a>
            )}
          </div>

          {/* Copy link */}
          <button
            onClick={doCopy}
            className="w-full text-sm font-medium border rounded-lg px-3 py-2 text-center"
          >
            Copy Link
          </button>

          {/* "Open guest view now" link */}
          <a
            href={publicUrl}
            target="_blank"
            className="block text-center text-[11px] text-gray-500 underline"
          >
            Open guest view now
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappHref}
            target="_blank"
            className="block w-full text-center rounded-lg px-3 py-2 font-medium border bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Open WhatsApp with message
          </a>

          {/* Email */}
          <a
            href={mailtoHref}
            className="block w-full text-center rounded-lg px-3 py-2 font-medium border bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            Draft Email
          </a>

          <p className="text-[11px] text-gray-500 text-center leading-snug">
            We’re not attaching the whole welcome guide. Guest opens it via link
            or QR. You look professional and they get live info.
          </p>
        </div>
      </div>
    </div>
  );
}
