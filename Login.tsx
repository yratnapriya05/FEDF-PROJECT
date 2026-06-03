import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

const demos = [
  { email: 'admin@skypnr.com', password: 'admin123', role: 'Admin' },
  { email: 'agent@skypnr.com', password: 'agent123', role: 'Agent' },
]

export function Login() {
  const [email, setEmail] = useState('admin@skypnr.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome to SkyPNR Pro')
      navigate('/')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/40">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SkyPNR Pro</h1>
          <p className="mt-1 text-sm text-slate-400">Airline Operations Control Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-sky-500/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-sky-500/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              required
            />
          </div>
          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in to Operations
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-sky-500/10 bg-white/5 p-3">
          <p className="mb-2 text-xs font-medium text-sky-400">Demo accounts</p>
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => { setEmail(d.email); setPassword(d.password) }}
              className="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-400 hover:bg-white/5 hover:text-white"
            >
              {d.role}: {d.email} / {d.password}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
