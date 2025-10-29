import React from 'react'
import { usePage } from '@inertiajs/react'

export default function Toast(){
  const { flash } = usePage().props
  const [open, setOpen] = React.useState(!!(flash?.success || flash?.error))
  const msg = flash?.success || flash?.error
  const isError = !!flash?.error

  React.useEffect(()=>{ setOpen(!!msg); const t = setTimeout(()=>setOpen(false), 3000); return ()=>clearTimeout(t) }, [msg])

  if(!open || !msg) return null
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2 shadow-lg ${isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {msg}
    </div>
  )
}
