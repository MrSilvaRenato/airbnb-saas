import React from 'react'
import { Link } from '@inertiajs/react'

const ICONS = {
    property: (
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto mb-4 text-gray-200">
            <rect x="10" y="35" width="60" height="35" rx="4" fill="currentColor"/>
            <polygon points="40,8 8,36 72,36" fill="currentColor" opacity="0.6"/>
            <rect x="30" y="50" width="20" height="20" rx="2" fill="white"/>
            <circle cx="58" cy="45" r="4" fill="white"/>
        </svg>
    ),
    stay: (
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto mb-4 text-gray-200">
            <rect x="8" y="16" width="64" height="56" rx="6" fill="currentColor"/>
            <rect x="8" y="16" width="64" height="18" rx="6" fill="currentColor" opacity="0.5"/>
            <rect x="20" y="8" width="8" height="16" rx="4" fill="currentColor" opacity="0.7"/>
            <rect x="52" y="8" width="8" height="16" rx="4" fill="currentColor" opacity="0.7"/>
            <rect x="20" y="44" width="12" height="12" rx="2" fill="white"/>
            <rect x="36" y="44" width="12" height="12" rx="2" fill="white"/>
            <rect x="52" y="44" width="8" height="12" rx="2" fill="white"/>
        </svg>
    ),
    maintenance: (
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto mb-4 text-gray-200">
            <circle cx="40" cy="40" r="28" fill="currentColor" opacity="0.3"/>
            <rect x="35" y="16" width="10" height="30" rx="5" fill="currentColor"/>
            <rect x="24" y="43" width="32" height="10" rx="5" fill="currentColor"/>
            <circle cx="40" cy="40" r="6" fill="white"/>
        </svg>
    ),
    analytics: (
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto mb-4 text-gray-200">
            <rect x="8" y="60" width="14" height="12" rx="2" fill="currentColor"/>
            <rect x="26" y="44" width="14" height="28" rx="2" fill="currentColor" opacity="0.7"/>
            <rect x="44" y="30" width="14" height="42" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="62" y="16" width="10" height="56" rx="2" fill="currentColor" opacity="0.3"/>
            <polyline points="15,55 33,40 51,26 67,12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto mb-4 text-gray-200">
            <rect x="8" y="18" width="64" height="54" rx="6" fill="currentColor"/>
            <rect x="8" y="18" width="64" height="20" rx="6" fill="currentColor" opacity="0.5"/>
            <rect x="22" y="8" width="8" height="16" rx="4" fill="currentColor" opacity="0.7"/>
            <rect x="50" y="8" width="8" height="16" rx="4" fill="currentColor" opacity="0.7"/>
            <rect x="18" y="48" width="10" height="10" rx="2" fill="white"/>
            <rect x="35" y="48" width="10" height="10" rx="2" fill="white"/>
            <rect x="52" y="48" width="10" height="10" rx="2" fill="white"/>
        </svg>
    ),
}

export default function EmptyState({ icon = 'stay', heading, body, cta }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {ICONS[icon] || ICONS.stay}
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{heading}</h3>
            {body && <p className="text-sm text-gray-400 max-w-xs mb-6">{body}</p>}
            {cta && (
                <Link
                    href={cta.href}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    {cta.label}
                </Link>
            )}
        </div>
    )
}
