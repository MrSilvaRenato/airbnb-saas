import { useState, useEffect, useRef } from 'react'

function csrf() { return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') }
function post(url, data) {
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

function Avatar({ letter, color = 'indigo' }) {
    const bg = color === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${bg}`}>
            {letter}
        </div>
    )
}

export default function ChatWidget() {
    const [open, setOpen]           = useState(false)
    const [available, setAvailable] = useState(false)
    const [phase, setPhase]         = useState('form')
    const [convId, setConvId]       = useState(null)
    const [messages, setMessages]   = useState([])
    const [name, setName]           = useState('')
    const [email, setEmail]         = useState('')
    const [firstMsg, setFirstMsg]   = useState('')
    const [reply, setReply]         = useState('')
    const [sending, setSending]     = useState(false)
    const [error, setError]         = useState('')
    const bottomRef = useRef(null)
    const pollRef   = useRef(null)
    const inputRef  = useRef(null)

    useEffect(() => {
        fetch('/chat-status').then(r => r.json()).then(d => setAvailable(!!d.available)).catch(() => {})
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (phase === 'chat' && convId) {
            pollRef.current = setInterval(() => {
                fetch(`/chat/${convId}/poll`).then(r => r.json()).then(d => {
                    setMessages(d.messages || [])
                    if (d.status === 'closed') { setPhase('closed'); clearInterval(pollRef.current) }
                }).catch(() => {})
            }, 3000)
        }
        return () => clearInterval(pollRef.current)
    }, [phase, convId])

    async function startChat(e) {
        e.preventDefault()
        setSending(true); setError('')
        try {
            const res = await post('/chat/start', { name, email, message: firstMsg })
            if (res.conversation_id) {
                setConvId(res.conversation_id)
                setMessages([{ id: 1, sender: 'guest', body: firstMsg, created_at: new Date().toISOString() }])
                setPhase('chat')
            } else { setError('Could not start chat. Try again.') }
        } catch { setError('Could not start chat. Try again.') }
        setSending(false)
    }

    async function sendReply(e) {
        e.preventDefault()
        if (!reply.trim()) return
        setSending(true)
        const body = reply; setReply('')
        try {
            await post(`/chat/${convId}/message`, { message: body })
            setMessages(m => [...m, { id: Date.now(), sender: 'guest', body, created_at: new Date().toISOString() }])
        } catch { setError('Failed to send.') }
        setSending(false)
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const guestInitial = name ? name[0].toUpperCase() : '?'

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
            >
                {open
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                }
            </button>

            {/* Window */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: 480 }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-base shrink-0">H</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm">HostFlows Support</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                <span className="text-white/70 text-xs">{available ? 'We\'re online' : 'Currently offline'}</span>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">

                        {/* Offline */}
                        {!available && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">H</div>
                                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-4 py-3 text-sm text-gray-700 max-w-[80%]">
                                    <div className="font-semibold text-gray-900 mb-1">We're offline right now</div>
                                    <p className="text-gray-500 text-xs leading-relaxed">Send us an email and we'll get back to you shortly.</p>
                                    <a href="mailto:support@hostflows.com.au" className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">support@hostflows.com.au</a>
                                </div>
                            </div>
                        )}

                        {/* Start form */}
                        {available && phase === 'form' && (
                            <>
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">H</div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-4 py-3 text-sm text-gray-700 max-w-[85%]">
                                        👋 Hi there! Fill in your details and we'll get back to you right away.
                                    </div>
                                </div>
                                <form onSubmit={startChat} className="space-y-2.5 pt-1">
                                    <input required className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                                    <input required type="email" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
                                    <textarea required rows={3} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" placeholder="How can we help you?" value={firstMsg} onChange={e => setFirstMsg(e.target.value)} />
                                    {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
                                    <button type="submit" disabled={sending} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition shadow-sm shadow-indigo-200">
                                        {sending ? 'Starting…' : 'Start conversation →'}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Messages */}
                        {phase === 'chat' && messages.map((m, i) => {
                            const isGuest = m.sender === 'guest'
                            const showName = isGuest && (i === 0 || messages[i-1]?.sender !== 'guest')
                            return (
                                <div key={m.id} className={`flex gap-2.5 ${isGuest ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {isGuest
                                        ? <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{guestInitial}</div>
                                        : <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">H</div>
                                    }
                                    <div className={`max-w-[72%] ${isGuest ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                        {showName && isGuest && <span className="text-[10px] text-gray-400 px-1">{name}</span>}
                                        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isGuest ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'}`}>
                                            {m.body}
                                        </div>
                                        <span className="text-[10px] text-gray-400 px-1">{timeAgo(m.created_at)}</span>
                                    </div>
                                </div>
                            )
                        })}

                        {phase === 'closed' && (
                            <div className="text-center py-4">
                                <div className="text-xs text-gray-400 bg-gray-100 rounded-full inline-block px-3 py-1">Conversation ended</div>
                                <p className="text-xs text-gray-400 mt-2">Need more help? <a href="mailto:support@hostflows.com.au" className="text-indigo-500 hover:underline">Email us</a></p>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Reply */}
                    {phase === 'chat' && (
                        <form onSubmit={sendReply} className="border-t border-gray-100 bg-white px-3 py-3 flex items-center gap-2 shrink-0">
                            <input
                                ref={inputRef}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                placeholder="Type a message…"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply(e)}
                            />
                            <button type="submit" disabled={sending || !reply.trim()}
                                className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 transition shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    )
}
