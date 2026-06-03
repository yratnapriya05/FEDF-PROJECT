import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Seat = {
  id: string
  row: number
  col: string
  cabin: string
  status: string
  passenger: string | null
}

const cabinLabels = { business: 'Business', premium: 'Premium Economy', economy: 'Economy' }
const cabinColors = {
  business: 'border-amber-500/40',
  premium: 'border-violet-500/40',
  economy: 'border-sky-500/20',
}

export function SeatMap() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [flight, setFlight] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [assignName, setAssignName] = useState('')
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const light = theme === 'light'

  const load = () => {
    api.get('/seats').then((r) => {
      setSeats(r.data.seats)
      setFlight(`${r.data.flight} · ${r.data.aircraft}`)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const seatColor = (s: Seat) => {
    if (s.status === 'occupied') return 'bg-red-500/80 cursor-not-allowed'
    if (s.status === 'blocked') return 'bg-slate-600/50 cursor-not-allowed'
    if (selected === s.id) return 'bg-sky-400 ring-2 ring-white'
    if (s.cabin === 'business') return 'bg-amber-500/40 hover:bg-amber-400/60 cursor-pointer'
    if (s.cabin === 'premium') return 'bg-violet-500/40 hover:bg-violet-400/60 cursor-pointer'
    return 'bg-emerald-500/30 hover:bg-emerald-400/50 cursor-pointer'
  }

  const assign = async () => {
    if (!selected || !assignName.trim()) return
    try {
      await api.patch(`/seats/${selected}`, { passengerName: assignName })
      toast.success(`Seat ${selected} assigned to ${assignName}`)
      setSelected(null)
      setAssignName('')
      load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'Assignment failed')
    }
  }

  const cabins = ['business', 'premium', 'economy'] as const

  if (loading) return <Skeleton className="mx-auto h-96 max-w-2xl" />

  return (
    <div className="space-y-6">
      <header>
        <h1 className={cn('text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>Seat Management</h1>
        <p className="text-sm text-slate-500">{flight} — Click available seat to assign</p>
      </header>

      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500/50" /> Available</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500/80" /> Occupied</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-500/50" /> Business</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-violet-500/50" /> Premium</span>
      </div>

      <div className="mx-auto max-w-lg">
        <div className={cn('mb-4 rounded-t-3xl border-2 border-b-0 py-3 text-center text-xs font-medium', light ? 'border-sky-200 bg-sky-50' : 'border-sky-500/30 bg-sky-900/30 text-sky-300')}>
          ▲ NOSE — SK101
        </div>

        {cabins.map((cabin) => {
          const cabinSeats = seats.filter((s) => s.cabin === cabin)
          const rows = [...new Set(cabinSeats.map((s) => s.row))].sort((a, b) => a - b)
          return (
            <div key={cabin} className={cn('border-x-2 px-4 py-4', cabinColors[cabin], light ? 'bg-white/50' : 'bg-white/5')}>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-sky-400">
                {cabinLabels[cabin]}
              </p>
              {rows.map((row) => (
                <div key={row} className="mb-2 flex items-center justify-center gap-1">
                  <span className="w-6 text-right font-mono text-xs text-slate-500">{row}</span>
                  {cabinSeats
                    .filter((s) => s.row === row)
                    .map((seat) => (
                      <motion.button
                        key={seat.id}
                        type="button"
                        whileHover={{ scale: seat.status === 'available' ? 1.1 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={seat.status !== 'available'}
                        onClick={() => setSelected(seat.id)}
                        title={seat.passenger || seat.id}
                        className={cn('h-8 w-8 rounded text-[10px] font-mono font-bold text-white/90', seatColor(seat))}
                      >
                        {seat.col}
                      </motion.button>
                    ))}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mx-auto flex max-w-md flex-wrap items-end gap-3 rounded-xl p-4', light ? 'glass-light' : 'glass')}
        >
          <div className="flex-1">
            <label className="text-xs text-slate-500">Assign seat {selected}</label>
            <input
              value={assignName}
              onChange={(e) => setAssignName(e.target.value)}
              placeholder="Passenger name"
              className={cn('mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-400', light ? 'border-sky-200' : 'border-sky-500/20 bg-white/5 text-white')}
            />
          </div>
          <Button onClick={assign}>Assign</Button>
          <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
        </motion.div>
      )}
    </div>
  )
}
