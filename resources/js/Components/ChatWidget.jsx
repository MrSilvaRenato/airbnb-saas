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

export default function ChatWidget() {
    const [open, setOpen]           = useState(false)
    const [available, setAvailable] = useState(false)
    const [phase, setPhase]         = useState('form') // form | chat | closed
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
            setConvId(res.data.conversation_id)
            setMessages([{ id: 1, sender: 'guest', body: firstMsg, created_at: new Date().toISOString() }])
            setPhase('chat')
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
    }

    return (
        <>
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
            >
                {open
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                }
            </button>

            {open && (
                <div className="fixed bottom-24 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: 440 }}>
                    <div className="bg-indigo-600 px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">H</div>
                        <div className="flex-1">
                            <div className="text-white text-sm font-semibold">HostFlows Support</div>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                <span className="text-white/70 text-xs">{available ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {!available && (
                            <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                                <div className="font-semibold text-gray-800 mb-1">We're offline right now</div>
                                Email us at <a href="mailto:support@hostflows.com.au" className="text-indigo-600 font-medium">support@hostflows.com.au</a>
                            </div>
                        )}

                        {available && phase === 'form' && (
                            <form onSubmit={startChat} className="space-y-3">
                                <div className="text-sm text-gray-600 bg-indigo-50 rounded-xl p-3">👋 Hi! How can we help you today?</div>
                                <input required className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                                <input required type="email" className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
                                <textarea required rows={3} className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Type your message…" value={firstMsg} onChange={e => setFirstMsg(e.target.value)} />
                                {error && <p className="text-xs text-red-500">{error}</p>}
                                <button type="submit" disabled={sending} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                                    {sending ? 'Starting…' : 'Start chat'}
                                </button>
                            </form>
                        )}

                        {phase === 'chat' && messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'guest' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.sender === 'guest' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                                    {m.body}
                                    <div className={`text-[10px] mt-1 ${m.sender === 'guest' ? 'text-white/60' : 'text-gray-400'}`}>{timeAgo(m.created_at)}</div>
                                </div>
                            </div>
                        ))}

                        {phase === 'closed' && (
                            <div className="text-sm text-center text-gray-400 py-4">Conversation closed. Email us for more help.</div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {phase === 'chat' && (
                        <form onSubmit={sendReply} className="border-t p-3 flex gap-2">
                            <input className="flex-1 border rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Type a message…" value={reply} onChange={e => setReply(e.target.value)} />
                            <button type="submit" disabled={sending || !reply.trim()} className="px-3 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    )
}
