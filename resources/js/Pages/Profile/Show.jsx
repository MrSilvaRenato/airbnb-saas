import { Head, Link, usePage } from '@inertiajs/react'
import Shell from '@/Layouts/Shell'

const PLAN_BADGE = {
    starter: { label: 'Starter', cls: 'bg-gray-100 text-gray-600' },
    host:    { label: 'Host',    cls: 'bg-indigo-100 text-indigo-700' },
    pro:     { label: 'Pro',     cls: 'bg-emerald-100 text-emerald-700' },
}

export default function Show({ user, propertiesCount, staysCount }) {
    const badge = PLAN_BADGE[user.plan] ?? PLAN_BADGE.starter
    const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    const memberSince = user.created_at ? new Date(user.created_at).getFullYear() : null

    return (
        <Shell>
            <Head title={`${user.name} — Profile`} />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Hero card */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Banner */}
                    <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="flex items-end justify-between -mt-12 mb-4">
                            <div className="relative">
                                {user.profile_photo
                                    ? <img src={user.profile_photo} alt={user.name}
                                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                                    : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 ring-4 ring-white shadow-md flex items-center justify-center text-white text-3xl font-black">
                                        {initials}
                                      </div>
                                }
                                <span className={`absolute -bottom-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white ${badge.cls}`}>
                                    {badge.label}
                                </span>
                            </div>
                            <Link href={route('profile.edit')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                                Edit Profile
                            </Link>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        {user.tagline && <p className="text-gray-500 mt-0.5">{user.tagline}</p>}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                            {user.location && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                                    {user.location}
                                </span>
                            )}
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                                    {user.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            {user.phone && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                                    {user.phone}
                                </span>
                            )}
                            {memberSince && (
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                                    Member since {memberSince}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats + Bio row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-indigo-600">{propertiesCount}</div>
                        <div className="text-sm text-gray-500 mt-1">Propert{propertiesCount === 1 ? 'y' : 'ies'}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-violet-600">{staysCount}</div>
                        <div className="text-sm text-gray-500 mt-1">Stay{staysCount === 1 ? '' : 's'} Created</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                        <div className={`text-lg font-black ${badge.cls.split(' ')[1]}`}>{badge.label}</div>
                        <div className="text-sm text-gray-500 mt-1">Current Plan</div>
                        <Link href={route('billing.manage')} className="text-[11px] text-indigo-500 hover:underline mt-1">Manage →</Link>
                    </div>
                </div>

                {/* Bio */}
                {user.bio && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">About</h2>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                    </div>
                )}

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { href: route('host.dashboard'), icon: '🏠', label: 'Dashboard' },
                            { href: route('properties.create'), icon: '➕', label: 'Add Property' },
                            { href: route('billing.manage'), icon: '💳', label: 'Billing' },
                            { href: route('profile.edit'), icon: '✏️', label: 'Edit Profile' },
                        ].map(a => (
                            <Link key={a.href} href={a.href}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition text-center">
                                <span className="text-xl">{a.icon}</span>
                                <span className="text-xs font-medium text-gray-600">{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Shell>
    )
}
