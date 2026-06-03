import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight, UserPlus, Trash2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type PassengerRow = {
  id: number
  name: string
  email: string
  pnr: string
  status: string
  tier: string
  avatar: string
  flight: string
  route: string
  seat: string
  class: string
}

export function PassengersList() {
  const { user } = useAuth()
  const canRegister = user?.role === 'admin' || user?.role === 'agent'
  const isAdmin = user?.role === 'admin'

  const [passengers, setPassengers] = useState<PassengerRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [route, setRoute] = useState('')
  const [travelClass, setTravelClass] = useState('Economy')
  const { theme } = useTheme()
  const light = theme === 'light'

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/passengers', { params: query ? { q: query } : {} })
      .then((r) => setPassengers(r.data))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    const t = setTimeout(load, query ? 200 : 0)
    return () => clearTimeout(t)
  }, [load, query])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Enter passenger name')
      return
    }
    setRegistering(true)
    try {
      const { data } = await api.post('/passengers', {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        flightNumber: flightNumber.trim() || undefined,
        route: route.trim() || undefined,
        travelClass: travelClass || undefined,
      })
      toast.success(`${data.passenger.name} registered · PNR ${data.pnr}`)
      setName('')
      setEmail('')
      setPhone('')
      setFlightNumber('')
      setRoute('')
      setShowMore(false)
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleDelete = async (id: number, passengerName: string) => {
    if (!confirm(`Remove ${passengerName} from registry?`)) return
    try {
      await api.delete(`/passengers/${id}`)
      toast.success('Passenger removed')
      load()
    } catch {
      toast.error('Could not remove passenger')
    }
  }

  const inputClass = cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400/40',
    light ? 'border-sky-200 bg-white text-sky-900' : 'border-sky-500/20 bg-white/5 text-white'
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className={cn('text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>Passenger Registry</h1>
        <p className={cn('text-sm', light ? 'text-slate-500' : 'text-slate-400')}>
          {canRegister
            ? 'Register passengers by name — you control who is on the system'
            : 'View registered passengers'}
        </p>
      </header>

      {canRegister && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleRegister}
          className={cn('rounded-2xl p-5', light ? 'glass-light border border-sky-200' : 'glass border border-sky-500/20')}
        >
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-sky-400" />
            <h2 className={cn('font-semibold', light ? 'text-sky-900' : 'text-white')}>Register new passenger</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Full name *</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <Button type="submit" disabled={registering} className="sm:mb-0">
              {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Register
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="mt-3 text-xs text-sky-400 hover:underline"
          >
            {showMore ? 'Hide optional fields' : '+ Optional: email, phone, flight…'}
          </button>

          {showMore && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Flight</label>
                <input type="text" placeholder="SK101" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Route</label>
                <input type="text" placeholder="JFK → LHR" value={route} onChange={(e) => setRoute(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Class</label>
                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)} className={inputClass}>
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </div>
            </div>
          )}
        </motion.form>
      )}

      {passengers.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
          <input
            type="text"
            placeholder="Search registered passengers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sky-400/40',
              light ? 'glass-light border-sky-200' : 'glass border-sky-500/20 text-white'
            )}
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : passengers.length === 0 ? (
        <div className={cn('rounded-2xl py-16 text-center', light ? 'glass-light' : 'glass')}>
          <UserPlus className="mx-auto h-12 w-12 text-sky-500/40" />
          <p className={cn('mt-4 font-medium', light ? 'text-sky-900' : 'text-white')}>No passengers yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {canRegister
              ? 'Type a name above and click Register to add your first passenger.'
              : 'No passengers have been registered.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {passengers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative"
            >
              <Link
                to={`/passengers/${p.id}`}
                className={cn(
                  'group flex flex-col rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1',
                  light ? 'glass-light hover:shadow-lg' : 'glass hover:shadow-lg hover:shadow-sky-500/10',
                  isAdmin && 'pr-10'
                )}
              >
                <div className="flex items-start gap-3">
                  <img src={p.avatar} alt="" className="h-12 w-12 rounded-xl bg-sky-500/10" />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate font-semibold', light ? 'text-sky-900' : 'text-white')}>{p.name}</p>
                    <p className="font-mono text-xs text-sky-400">{p.pnr}</p>
                    <div className="mt-1">
                      <Badge status={p.status} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-sky-400" />
                </div>
                <div className={cn('mt-3 border-t pt-3 text-xs', light ? 'border-sky-100 text-slate-500' : 'border-white/5 text-slate-500')}>
                  <p>{p.flight} · {p.route}</p>
                  <p className="mt-0.5">{p.class}</p>
                </div>
              </Link>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
                  title="Remove passenger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
