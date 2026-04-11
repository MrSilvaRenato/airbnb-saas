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

export default function AdminChatDrawer() {
    const [open, setOpen]             = useState(false)
    const [convs, setConvs]           = useState([])
    const [active, setActive]         = useState(null)
    const [reply, setReply]           = useState('')
    const [sending, setSending]       = useState(false)
    const [totalUnread, setTotalUnread] = useState(0)
    const bottomRef = useRef(null)
    const pollRef   = useRef(null)

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
    }

    async function closeConv() {
        if (!active) return
        await post(`/admin/chat/${active.id}/close`).catch(() => {})
        setActive(null)
        load()
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-black transition"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{totalUnread > 9 ? '9+' : totalUnread}</span>
                )}
            </button>

            {/* Drawer */}
            {open && (
                <div className="fixed bottom-24 right-5 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex overflow-hidden" style={{ height: 520 }}>

                    {/* Conversation list */}
                    <div className={`flex flex-col border-r ${active ? 'w-36' : 'flex-1'}`}>
                        <div className="px-3 py-3 border-b flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Chats</span>
                            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {convs.length === 0 && <div className="p-4 text-xs text-gray-400 text-center">No conversations yet</div>}
                            {convs.map(c => (
                                <button key={c.id} onClick={() => openConv(c)}
                                    className={`w-full text-left px-3 py-2.5 border-b hover:bg-gray-50 transition ${active?.id === c.id ? 'bg-indigo-50' : ''}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-gray-900 truncate flex-1">{c.guest_name}</span>
                                        {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{c.unread}</span>}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{c.last_message || '—'}</div>
                                    <div className={`text-[9px] mt-0.5 font-medium ${c.status === 'closed' ? 'text-gray-300' : 'text-emerald-500'}`}>{c.status}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active conversation */}
                    {active && (
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="px-3 py-2.5 border-b flex items-center gap-2">
                                <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 truncate">{active.guest_name}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{active.guest_email}</div>
                                </div>
                                {active.status === 'open' && (
                                    <button onClick={closeConv} className="text-[10px] text-gray-400 hover:text-red-500 border rounded px-1.5 py-0.5 shrink-0">Close</button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {active.messages?.map(m => (
                                    <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${m.sender === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                            {m.body}
                                            <div className={`text-[9px] mt-0.5 ${m.sender === 'admin' ? 'text-white/50' : 'text-gray-400'}`}>{timeAgo(m.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            {active.status === 'open' ? (
                                <form onSubmit={sendReply} className="border-t p-2 flex gap-2">
                                    <input className="flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Reply…" value={reply} onChange={e => setReply(e.target.value)} />
                                    <button type="submit" disabled={sending || !reply.trim()} className="px-2.5 py-1.5 rounded-xl bg-gray-900 text-white disabled:opacity-40 hover:bg-black transition">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                                    </button>
                                </form>
                            ) : (
                                <div className="border-t p-3 text-xs text-center text-gray-400">Conversation closed</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
