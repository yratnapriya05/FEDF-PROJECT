import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Mail, Phone, FileText, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

type PnrData = {
  pnr: string
  status: string
  passenger: {
    id: number
    name: string
    email: string
    phone: string
    passport: string
    tier: string
    avatar: string
    ssr: string[]
  }
  flight: { number: string; route: string; date: string; seat: string; class: string }
  timeline: Array<{ time: string; event: string; location: string }>
  history: Array<{ date: string; route: string; flight: string }>
}

export function PassengerDetail() {
  const { id } = useParams()
  const [data, setData] = useState<PnrData | null>(null)
  const [error, setError] = useState(false)
  const { theme } = useTheme()
  const light = theme === 'light'

  useEffect(() => {
    setData(null)
    setError(false)
    api
      .get(`/passengers/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setError(true))
  }, [id])

  if (!data && !error) return <Skeleton className="mx-auto h-96 max-w-3xl" />

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-slate-500">Passenger not found.</p>
        <Link to="/passengers" className="mt-4 inline-block text-sky-400 hover:underline">
          ← Back to registry
        </Link>
      </div>
    )
  }

  const p = data.passenger

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/passengers"
        className={cn('inline-flex items-center gap-2 text-sm', light ? 'text-sky-600' : 'text-sky-400')}
      >
        <ArrowLeft className="h-4 w-4" />
        All passengers
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-2xl p-6', light ? 'glass-light' : 'glass')}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img src={p.avatar} alt="" className="h-24 w-24 rounded-2xl border-2 border-sky-500/30 shadow-lg" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className={cn('text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>{p.name}</h1>
              <Badge status={data.status} />
            </div>
            <p className="font-mono text-sm text-sky-400">{data.pnr}</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-400">
              <Award className="h-4 w-4" />
              {p.tier} Member
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p className="flex items-center justify-center gap-2 sm:justify-start"><Mail className="h-4 w-4" />{p.email}</p>
              <p className="flex items-center justify-center gap-2 sm:justify-start"><Phone className="h-4 w-4" />{p.phone}</p>
              <p className="flex items-center justify-center gap-2 sm:justify-start"><FileText className="h-4 w-4" />{p.passport}</p>
            </div>
          </div>
        </div>

        {p.ssr.length > 0 && (
          <div className="mt-6">
            <h3 className={cn('mb-2 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>SSR Requests</h3>
            <div className="flex flex-wrap gap-2">
              {p.ssr.map((s) => (
                <span key={s} className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1 font-mono text-xs text-sky-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className={cn('rounded-2xl p-6', light ? 'glass-light' : 'glass')}>
        <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Current Trip</h3>
        <p className="text-lg font-medium">{data.flight.number} · {data.flight.route}</p>
        <p className="text-sm text-slate-500">{data.flight.date} · Seat {data.flight.seat} · {data.flight.class}</p>
      </div>

      <div className={cn('rounded-2xl p-6', light ? 'glass-light' : 'glass')}>
        <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Travel History</h3>
        <div className="space-y-3">
          {data.history.map((h, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span>{h.route}</span>
              <span className="font-mono text-sky-400">{h.flight}</span>
              <span className="text-slate-500">{h.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={cn('rounded-2xl p-6', light ? 'glass-light' : 'glass')}>
        <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Activity Timeline</h3>
        <div className="space-y-4 border-l border-sky-500/20 pl-4">
          {data.timeline.map((t, i) => (
            <div key={i}>
              <p className="text-xs text-slate-500">{t.time}</p>
              <p className={cn('font-medium', light ? 'text-slate-800' : 'text-white')}>{t.event}</p>
              <p className="text-xs text-sky-400">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
