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

function timeAgo(ts) {
    const d = Math.floor((Date.now() - new Date(ts + 'Z')) / 60000)
    if (d < 1) return 'just now'
    if (d < 60) return `${d}m ago`
    return `${Math.floor(d / 60)}h ago`
}

function GuestAvatar({ name }) {
    const letter = name ? name[0].toUpperCase() : '?'
    return (
        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
            {letter}
        </div>
    )
}

function AdminAvatar() {
    return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            H
        </div>
    )
}

export default function AdminChatDrawer() {
    const [open, setOpen]               = useState(false)
    const [convs, setConvs]             = useState([])
    const [active, setActive]           = useState(null)
    const [reply, setReply]             = useState('')
    const [sending, setSending]         = useState(false)
    const [totalUnread, setTotalUnread] = useState(0)
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

    useEffect(() => {
        load()
        pollRef.current = setInterval(load, 3000)
        return () => clearInterval(pollRef.current)
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [active?.messages])

    async function openConv(conv) {
        setActive(conv)
        await post(`/admin/chat/${conv.id}/read`).catch(() => {})
        load()
    }

    async function sendReply(e) {
        e.preventDefault()
        if (!reply.trim() || !active) return
        setSending(true)
        const body = reply; setReply('')
        await post(`/admin/chat/${active.id}/reply`, { message: body }).catch(() => {})
        setSending(false)
        load()
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    async function closeConv() {
        if (!active) return
        await post(`/admin/chat/${active.id}/close`).catch(() => {})
        setActive(null)
        load()
    }

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
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
                <div className="fixed bottom-24 right-5 z-50 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex overflow-hidden" style={{ height: 540 }}>

                    {/* Conversation list */}
                    <div className={`flex flex-col border-r border-gray-100 ${active ? 'w-40' : 'flex-1'} transition-all`}>
                        {/* List header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-3 flex items-center justify-between shrink-0">
                            <span className="text-white font-semibold text-sm">Support Inbox</span>
                            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50/50">
                            {convs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full gap-2 py-8 px-4 text-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    </div>
                                    <p className="text-xs text-gray-400">No conversations yet</p>
                                </div>
                            )}
                            {convs.map(c => (
                                <button key={c.id} onClick={() => openConv(c)}
                                    className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-white transition ${active?.id === c.id ? 'bg-white border-l-2 border-l-indigo-500' : ''}`}
                                >
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                                            {c.guest_name?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 truncate flex-1">{c.guest_name}</span>
                                        {c.unread > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{c.unread}</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate">{c.last_message || '—'}</div>
                                    <div className={`text-[9px] mt-0.5 font-medium ${c.status === 'closed' ? 'text-gray-300' : 'text-emerald-500'}`}>
                                        {c.status === 'closed' ? 'Closed' : '● Active'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active conversation */}
                    {active ? (
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Thread header */}
                            <div className="px-3 py-2.5 border-b border-gray-100 bg-white flex items-center gap-2 shrink-0">
                                <button onClick={() => setActive(null)} className="text-gray-300 hover:text-gray-600 transition">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                    {active.guest_name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 truncate">{active.guest_name}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{active.guest_email}</div>
                                </div>
                                {active.status === 'open' && (
                                    <button onClick={closeConv} className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2 py-1 shrink-0 transition">
                                        End chat
                                    </button>
                                )}
                            </div>

                            {/* Messages */}
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
                                                }`}>
                                                    {m.body}
                                                </div>
                                                <span className="text-[10px] text-gray-400 px-1">{timeAgo(m.created_at)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {active.messages?.length === 0 && (
                                    <div className="text-center text-xs text-gray-300 py-6">No messages yet</div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Reply input */}
                            {active.status === 'open' ? (
                                <form onSubmit={sendReply} className="border-t border-gray-100 bg-white px-3 py-3 flex items-center gap-2 shrink-0">
                                    <input
                                        ref={inputRef}
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
                                <div className="border-t border-gray-100 bg-white px-3 py-3">
                                    <div className="text-center">
                                        <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full inline-block px-3 py-1">Conversation closed</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty state when no conversation selected */
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-700">Select a conversation</div>
                                <div className="text-xs text-gray-400 mt-0.5">Choose a chat from the left to reply</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
