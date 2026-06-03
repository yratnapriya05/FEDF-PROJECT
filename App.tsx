import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { PnrSearch } from '@/pages/PnrSearch'
import { SeatMap } from '@/pages/SeatMap'
import { PassengersList } from '@/pages/PassengersList'
import { PassengerDetail } from '@/pages/PassengerDetail'
import { Admin } from '@/pages/Admin'
import { Skeleton } from '@/components/ui/Skeleton'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-12 w-48" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pnr" element={<PnrSearch />} />
        <Route path="seats" element={<SeatMap />} />
        <Route path="passengers" element={<PassengersList />} />
        <Route path="passengers/:id" element={<PassengerDetail />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
