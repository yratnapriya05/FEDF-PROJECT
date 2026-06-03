import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { jsPDF } from 'jspdf'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

type PnrResult = {
  pnr: string
  status: string
  passenger: { id: number; name: string; email: string; tier: string; avatar: string }
  flight: { number: string; route: string; date: string; seat: string; class: string }
  timeline: Array<{ time: string; event: string; location: string }>
}

export function PnrSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PnrResult[]>([])
  const [selected, setSelected] = useState<PnrResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme()
  const light = theme === 'light'

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSelected(null); return }
    setLoading(true)
    try {
      const { data } = await api.get('/pnr/search', { params: { q } })
      setResults(data.results)
      setSelected(data.results[0] || null)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadPdf = () => {
    if (!selected) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('SkyPNR Pro — Booking Confirmation', 20, 20)
    doc.setFontSize(12)
    doc.text(`PNR: ${selected.pnr}`, 20, 40)
    doc.text(`Passenger: ${selected.passenger.name}`, 20, 50)
    doc.text(`Flight: ${selected.flight.number} ${selected.flight.route}`, 20, 60)
    doc.text(`Date: ${selected.flight.date} · Seat: ${selected.flight.seat}`, 20, 70)
    doc.save(`booking-${selected.pnr}.pdf`)
    toast.success('PDF downloaded')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className={cn('text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>PNR Lookup</h1>
        <p className={cn('text-sm', light ? 'text-slate-500' : 'text-slate-400')}>
          Search passengers you registered · by name or PNR
        </p>
      </div>

      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-400" />
        <input
          type="text"
          placeholder="Enter PNR (e.g. ABC123)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            search(e.target.value)
          }}
          className={cn(
            'w-full rounded-2xl border py-4 pl-12 pr-4 text-lg outline-none transition-all focus:ring-2 focus:ring-sky-400/50',
            light ? 'glass-light border-sky-200 text-sky-900' : 'glass border-sky-500/20 text-white'
          )}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        )}
      </div>

      {results.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {results.map((r) => (
            <button
              key={r.pnr}
              type="button"
              onClick={() => setSelected(r)}
              className={cn(
                'rounded-lg px-3 py-1.5 font-mono text-sm',
                selected?.pnr === r.pnr ? 'bg-sky-500 text-white' : 'bg-white/10 text-sky-300'
              )}
            >
              {r.pnr}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.pnr}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('rounded-2xl p-6', light ? 'glass-light' : 'glass')}
          >
            <div className="grid gap-6 md:grid-cols-[1fr_auto]">
              <div className="flex gap-4">
                <img src={selected.passenger.avatar} alt="" className="h-16 w-16 rounded-xl bg-sky-500/20" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={cn('text-xl font-bold', light ? 'text-sky-900' : 'text-white')}>{selected.passenger.name}</h2>
                    <Badge status={selected.status} />
                  </div>
                  <p className="font-mono text-sky-400">{selected.pnr}</p>
                  <p className="text-sm text-slate-500">{selected.passenger.email} · {selected.passenger.tier}</p>
                  <p className="mt-2 text-sm">
                    {selected.flight.number} · {selected.flight.route} · {selected.flight.date}
                  </p>
                  <p className="text-sm">Seat {selected.flight.seat} · {selected.flight.class}</p>
                  <Link to={`/passengers/${selected.passenger.id}`} className="mt-2 inline-block text-sm text-sky-400 hover:underline">
                    View full profile →
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl bg-white p-3">
                  <QRCodeSVG value={selected.pnr} size={100} />
                </div>
                <Button variant="outline" onClick={downloadPdf} className="text-xs">
                  <Download className="h-3 w-3" />
                  Download PDF
                </Button>
              </div>
            </div>

            <h3 className={cn('mb-3 mt-6 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Travel Timeline</h3>
            <div className="relative border-l border-sky-500/30 pl-6 space-y-4">
              {selected.timeline.map((t, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-sky-400 ring-4 ring-sky-500/20" />
                  <p className="text-xs text-slate-500">{t.time}</p>
                  <p className={cn('font-medium', light ? 'text-slate-800' : 'text-white')}>{t.event}</p>
                  <p className="text-xs text-sky-400">{t.location}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && query && !loading && (
        <p className="text-center text-slate-500">No match. Register passengers first under Passengers.</p>
      )}
    </div>
  )
}
