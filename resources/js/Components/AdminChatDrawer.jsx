import { useState, useEffect, useRef } from 'react'

function csrf() { return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') }
function post(url, data = {}) {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
        body: JSON.stringify(data),
    }).then(r => r.json())
}
function del(url) {
    return fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
    }).then(r => r.json())
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
}

async function testLocalNotification() {
    try {
        const registration = await navigator.serviceWorker.ready

        await registration.showNotification('Local test notification', {
            body: 'If you see this, the browser + service worker can display notifications.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: {
                url: '/admin/dashboard',
            },
        })

        alert('Local notification triggered')
    } catch (e) {
        console.error('Local notification failed', e)
        alert('Local notification failed')
    }
}

async function enablePushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        alert('Push notifications are not supported on this browser.')
        return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    await navigator.serviceWorker.register('/sw.js')
    const ready = await navigator.serviceWorker.ready

    let subscription = await ready.pushManager.getSubscription()

    if (!subscription) {
        subscription = await ready.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        })
    }

    await fetch('/push/subscribe', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf(),
            'Accept': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
    })

    alert('Push notifications enabled')
}

function timeAgo(ts) {
    const d = Math.floor((Date.now() - new Date(ts + 'Z')) / 60000)
    if (d < 1) return 'just now'
    if (d < 60) return `${d}m ago`
    if (d < 1440) return `${Math.floor(d / 60)}h ago`
    return `${Math.floor(d / 1440)}d ago`
}

function GuestAvatar({ name, size = 'md' }) {
    const sz = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs'
    return (
        <div className={`${sz} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0`}>
            {name?.[0]?.toUpperCase() ?? '?'}
        </div>
    )
}
function AdminAvatar() {
    return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">H</div>
    )
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Active' },
    { key: 'closed', label: 'Closed' },
    { key: 'archived', label: 'Archived' },
]

export default function AdminChatDrawer() {
    const [open, setOpen]               = useState(false)
    const [convs, setConvs]             = useState([])
    const [active, setActive]           = useState(null)
    const [reply, setReply]             = useState('')
    const [sending, setSending]         = useState(false)
    const [totalUnread, setTotalUnread] = useState(0)
    const [tab, setTab]                 = useState('all')
    const [search, setSearch]           = useState('')
    const [hoverId, setHoverId]         = useState(null)
    const [selected, setSelected]       = useState(new Set())
    const [confirmClear, setConfirmClear] = useState(false)
    const [confirmBulk, setConfirmBulk]   = useState(null) // 'archive' | 'delete'
    const [pushLoading, setPushLoading] = useState(false)
    const bottomRef = useRef(null)
    const pollRef   = useRef(null)
    const inputRef  = useRef(null)

    function load() {
        fetch('/admin/chat/conversations').then(r => r.json()).then(data => {
            setConvs(data)
            setTotalUnread(data.reduce((s, c) => s + c.unread, 0))
            if (active) {
                const updated = data.find(c => c.id === active.id)
                if (updated) setActive(updated)
            }
        }).catch(() => {})
    }

    useEffect(() => { load(); pollRef.current = setInterval(load, 3000); return () => clearInterval(pollRef.current) }, [])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [active?.messages])

    // Clear selection when tab changes
    useEffect(() => setSelected(new Set()), [tab])

    const filtered = convs.filter(c => {
        const matchTab = tab === 'all' || c.status === tab
        const matchSearch = !search || c.guest_name.toLowerCase().includes(search.toLowerCase()) || c.guest_email.toLowerCase().includes(search.toLowerCase())
        return matchTab && matchSearch
    })

    const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id))
    const someSelected = selected.size > 0

    function toggleSelect(id, e) {
        e.stopPropagation()
        setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
    }
    function toggleAll() {
        if (allSelected) setSelected(new Set())
        else setSelected(new Set(filtered.map(c => c.id)))
    }

    async function openConv(conv) {
        setActive(conv)
        setSelected(new Set())
        await post(`/admin/chat/${conv.id}/read`).catch(() => {})
        load()
    }

    async function sendReply(e) {
        e.preventDefault()
        if (!reply.trim() || !active) return
        setSending(true)
        const body = reply; setReply('')
        await post(`/admin/chat/${active.id}/reply`, { message: body }).catch(() => {})
        setSending(false); load()
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    async function handleEnablePush() {
    try {
        setPushLoading(true)
        await enablePushNotifications()
    } catch (e) {
        console.error('Push setup failed', e)
        alert('Could not enable push notifications.')
    } finally {
        setPushLoading(false)
    }
}

    async function closeConv() {
        await post(`/admin/chat/${active.id}/close`).catch(() => {})
        setActive(null); load()
    }

    async function archiveConv(conv, e) {
        e?.stopPropagation()
        await post(`/admin/chat/${conv.id}/archive`).catch(() => {})
        if (active?.id === conv.id) setActive(null)
        load()
    }

    async function deleteConv(conv, e) {
        e?.stopPropagation()
        await del(`/admin/chat/${conv.id}`).catch(() => {})
        if (active?.id === conv.id) setActive(null)
        load()
    }

    async function doClear() {
        const filter = tab === 'open' ? 'closed' : tab  // don't clear open via this path
        await post('/admin/chat/clear', { filter }).catch(() => {})
        setConfirmClear(false)
        if (active) setActive(null)
        load()
    }

    async function doBulk(action) {
        const ids = [...selected]
        await post('/admin/chat/bulk', { ids, action }).catch(() => {})
        if (active && selected.has(active.id)) setActive(null)
        setSelected(new Set())
        setConfirmBulk(null)
        load()
    }

    const clearableCount = convs.filter(c => tab === 'all' ? ['closed','archived'].includes(c.status) : c.status === tab && c.status !== 'open').length

    return (
        <>
            {/* FAB */}
            <button onClick={() => setOpen(o => !o)}
                className="fixed bottom-5 right-24 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                {open
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                }
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Drawer */}
            {open && (
                <div className="fixed bottom-24 right-5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex overflow-hidden"
                    style={{ width: active ? 520 : 320, height: 580, transition: 'width 0.2s ease' }}>

                    {/* Left panel */}
                    <div className={`flex flex-col border-r border-gray-100 ${active ? 'w-52' : 'flex-1'} shrink-0`}>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-3 pt-3 pb-0 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold text-sm">Support Inbox</span>
                             <div className="flex items-center gap-1.5">
    <button
        onClick={handleEnablePush}
        disabled={pushLoading}
        className="text-white/80 hover:text-white text-[10px] border border-white/20 rounded-md px-1.5 py-0.5 transition disabled:opacity-50"
        title="Enable push notifications on this device"
    >
        {pushLoading ? 'Enabling…' : 'Enable Push'}
    </button>

    <button
    onClick={testLocalNotification}
    className="text-white/80 hover:text-white text-[10px] border border-white/20 rounded-md px-1.5 py-0.5 transition"
    title="Test local notification"
>
    Test Push
</button>

    {clearableCount > 0 && !someSelected && (
        <button onClick={() => setConfirmClear(true)}
            className="text-white/60 hover:text-white text-[10px] border border-white/20 rounded-md px-1.5 py-0.5 transition">
            Clear {clearableCount}
        </button>
    )}

    <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </button>
</div>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-0.5">
                                {TABS.map(t => {
                                    const count = t.key === 'all' ? convs.length : convs.filter(c => c.status === t.key).length
                                    return (
                                        <button key={t.key} onClick={() => setTab(t.key)}
                                            className={`flex-1 text-[10px] font-medium py-1.5 rounded-t-lg transition ${tab === t.key ? 'bg-white text-indigo-700' : 'text-white/70 hover:text-white'}`}>
                                            {t.label}{count > 0 ? ` (${count})` : ''}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Search + select-all row */}
                        <div className="px-2 py-2 border-b border-gray-100 bg-white shrink-0 space-y-1.5">
                            <div className="relative">
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
                                <input
                                    className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400 focus:border-transparent transition"
                                    placeholder="Search name or email…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Select all + bulk actions */}
                            {filtered.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <label className="flex items-center gap-1.5 cursor-pointer flex-1">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll}
                                            className="w-3 h-3 rounded accent-indigo-600" />
                                        <span className="text-[10px] text-gray-500">
                                            {someSelected ? `${selected.size} selected` : 'Select all'}
                                        </span>
                                    </label>
                                    {someSelected && (
                                        <>
                                            <button onClick={() => setConfirmBulk('archive')}
                                                className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition">
                                                Archive
                                            </button>
                                            <button onClick={() => setConfirmBulk('delete')}
                                                className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/50">
                            {filtered.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-xs text-gray-400">{search ? 'No matches' : 'No conversations'}</p>
                                </div>
                            )}
                            {filtered.map(c => (
                                <div key={c.id}
                                    onMouseEnter={() => setHoverId(c.id)}
                                    onMouseLeave={() => setHoverId(null)}
                                    className={`relative border-b border-gray-100 transition ${active?.id === c.id ? 'bg-white border-l-2 border-l-indigo-500' : selected.has(c.id) ? 'bg-indigo-50' : 'hover:bg-white'}`}>

                                    <button onClick={() => openConv(c)} className="w-full text-left px-3 py-2.5 pl-8">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <GuestAvatar name={c.guest_name} size="sm" />
                                            <span className="text-xs font-semibold text-gray-900 truncate flex-1">{c.guest_name}</span>
                                            {c.plan && c.plan !== 'guest' && (
                                                <span className={`text-[8px] font-bold px-1 py-0.5 rounded shrink-0 ${c.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' : c.plan === 'host' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {c.plan.toUpperCase()}
                                                </span>
                                            )}
                                            {c.unread > 0 && (
                                                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{c.unread}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate">{c.last_message || '—'}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[9px] font-medium ${c.status === 'open' ? 'text-emerald-500' : c.status === 'archived' ? 'text-amber-400' : 'text-gray-300'}`}>
                                                {c.status === 'open' ? '● Active' : c.status === 'archived' ? '⊘ Archived' : '✕ Closed'}
                                            </span>
                                            {c.last_at && <span className="text-[9px] text-gray-300">{timeAgo(c.last_at)}</span>}
                                        </div>
                                    </button>

                                    {/* Checkbox */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                        <input type="checkbox"
                                            checked={selected.has(c.id)}
                                            onChange={e => toggleSelect(c.id, e)}
                                            onClick={e => e.stopPropagation()}
                                            className="w-3 h-3 rounded accent-indigo-600 cursor-pointer"
                                        />
                                    </div>

                                    {/* Per-row hover actions */}
                                    {hoverId === c.id && !someSelected && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            {c.status !== 'archived' && (
                                                <button onClick={e => archiveConv(c, e)} title="Archive"
                                                    className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/></svg>
                                                </button>
                                            )}
                                            <button onClick={e => deleteConv(c, e)} title="Delete"
                                                className="w-6 h-6 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — active thread */}
                    {active && (
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="px-3 py-2.5 border-b border-gray-100 bg-white flex items-center gap-2 shrink-0">
                                <button onClick={() => setActive(null)} className="text-gray-300 hover:text-gray-600 transition">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <GuestAvatar name={active.guest_name} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <div className="text-xs font-semibold text-gray-900 truncate">{active.guest_name}</div>
                                        {active.plan && active.plan !== 'guest' && (
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${active.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {active.plan.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate">{active.guest_email}</div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {active.status === 'open' && (
                                        <>
                                            <button onClick={e => archiveConv(active, e)}
                                                className="text-[10px] text-amber-500 hover:text-amber-600 border border-amber-200 rounded-lg px-2 py-1 transition">Archive</button>
                                            <button onClick={closeConv}
                                                className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2 py-1 transition">End chat</button>
                                        </>
                                    )}
                                    {active.status !== 'open' && (
                                        <button onClick={e => deleteConv(active, e)}
                                            className="text-[10px] text-red-400 hover:text-red-600 border border-red-100 rounded-lg px-2 py-1 transition">Delete</button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/50">
                                {active.messages?.map((m, i) => {
                                    const isAdmin = m.sender === 'admin'
                                    const showName = !isAdmin && (i === 0 || active.messages[i-1]?.sender === 'admin')
                                    return (
                                        <div key={m.id} className={`flex gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {isAdmin ? <AdminAvatar /> : <GuestAvatar name={active.guest_name} />}
                                            <div className={`max-w-[72%] flex flex-col gap-0.5 ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                {showName && !isAdmin && (
                                                    <span className="text-[10px] text-gray-400 px-1">{active.guest_name}</span>
                                                )}
                                                <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                                    isAdmin
                                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                        : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'
                                                }`}>{m.body}</div>
                                                <span className="text-[10px] text-gray-400 px-1">{timeAgo(m.created_at)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {!active.messages?.length && (
                                    <div className="text-center text-xs text-gray-300 py-6">No messages yet</div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {active.status === 'open' ? (
                                <form onSubmit={sendReply} className="border-t border-gray-100 bg-white px-3 py-3 flex items-center gap-2 shrink-0">
                                    <input ref={inputRef}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                        placeholder="Reply to guest…"
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply(e)}
                                    />
                                    <button type="submit" disabled={sending || !reply.trim()}
                                        className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 transition shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                                    </button>
                                </form>
                            ) : (
                                <div className="border-t border-gray-100 bg-white px-3 py-3 text-center">
                                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full inline-block px-3 py-1">
                                        {active.status === 'archived' ? 'Conversation archived' : 'Conversation closed'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm clear modal */}
            {confirmClear && (
                <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl">
                        <div className="text-sm font-semibold text-gray-900 mb-1">Clear {clearableCount} conversation{clearableCount !== 1 ? 's' : ''}?</div>
                        <p className="text-xs text-gray-500 mb-4">Permanently deletes all {tab === 'all' ? 'closed & archived' : tab} conversations and their messages.</p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setConfirmClear(false)} className="px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={doClear} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition">Delete all</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm bulk action modal */}
            {confirmBulk && (
                <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                            {confirmBulk === 'archive' ? 'Archive' : 'Delete'} {selected.size} conversation{selected.size !== 1 ? 's' : ''}?
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            {confirmBulk === 'delete' ? 'This permanently removes the selected conversations and all their messages.' : 'Selected conversations will be moved to Archived.'}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setConfirmBulk(null)} className="px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={() => doBulk(confirmBulk)}
                                className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition ${confirmBulk === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                {confirmBulk === 'archive' ? 'Archive all' : 'Delete all'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
