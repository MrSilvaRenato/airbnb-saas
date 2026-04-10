import React from "react";
import { Link, router } from "@inertiajs/react";

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10l4.5 4.5L16 6" />
  </svg>
);

const steps = [
  {
    number: 1,
    title: "Add a Property",
    description:
      "Create your first property so you can start building guest welcome pages.",
    cta: "Add Property",
  },
  {
    number: 2,
    title: "Create a Stay",
    description:
      "Set up a stay for an upcoming guest — add dates, guest info, and arrival details.",
    cta: "Go to Dashboard",
  },
  {
    number: 3,
    title: "View Your Guest Page",
    description:
      "See exactly what your guest will see when they open their welcome link.",
    cta: "Done — view your guest page",
  },
];

function StepCard({ stepDef, currentStep }) {
  const { number, title, description, cta } = stepDef;
  const isDone = currentStep > number;
  const isCurrent = currentStep === number - 1 || (currentStep === 0 && number === 1);

  // Determine CTA href
  let href = null;
  if (number === 1) {
    href = route("properties.create");
  } else if (number === 2) {
    href = route("host.dashboard");
  } else if (number === 3) {
    href = route("host.dashboard");
  }

  const borderClass = isDone
    ? "border-emerald-300 bg-emerald-50"
    : isCurrent
    ? "border-indigo-400 bg-white shadow-sm"
    : "border-gray-200 bg-white";

  const badgeClass = isDone
    ? "bg-emerald-500 text-white"
    : isCurrent
    ? "bg-indigo-600 text-white"
    : "bg-gray-200 text-gray-500";

  const ctaClass = isDone
    ? "bg-emerald-100 text-emerald-700 cursor-default pointer-events-none"
    : isCurrent
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 p-5 transition-all ${borderClass}`}
    >
      {/* Header row: number badge + title + check */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0 ${badgeClass}`}
        >
          {isDone ? <CheckIcon /> : number}
        </span>
        <span
          className={`font-semibold text-sm ${
            isDone
              ? "text-emerald-800 line-through"
              : isCurrent
              ? "text-gray-900"
              : "text-gray-400"
          }`}
        >
          {title}
        </span>
        {isDone && (
          <span className="ml-auto text-emerald-500">
            <svg
              viewBox="0 0 20 20"
              className="w-5 h-5"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-xs leading-relaxed ${
          isDone ? "text-emerald-700" : isCurrent ? "text-gray-600" : "text-gray-400"
        }`}
      >
        {description}
      </p>

      {/* CTA */}
      {href && !isDone ? (
        <Link
          href={href}
          className={`mt-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${ctaClass}`}
        >
          {cta}
        </Link>
      ) : (
        <span
          className={`mt-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium ${ctaClass}`}
        >
          {isDone ? "Completed" : cta}
        </span>
      )}
    </div>
  );
}

export default function OnboardingWizard({ step = 0, skipped = false, firstPropertyId = null }) {
  // Hide if complete or skipped
  if (step >= 3 || skipped) return null;

  const handleSkip = () => {
    router.post(route("onboarding.skip"), {}, { preserveScroll: true });
  };

  return (
    <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Get started with HostFlows
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Complete these steps to set up your first guest welcome page.
          </p>
        </div>
        {/* Progress indicator */}
        <span className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
          {step} / 3
        </span>
      </div>

      {/* Step cards — horizontal on md+, stacked on mobile */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {steps.map((s) => (
          <StepCard key={s.number} stepDef={s} currentStep={step} />
        ))}
      </div>

      {/* Skip link */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
        >
          Skip setup
        </button>
      </div>
    </div>
  );
}
