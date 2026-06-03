import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import {
  users,
  dashboard,
  revenueChart,
  occupancyChart,
  flights,
  heatmap,
  generateSeats,
  adminUsers,
  auditLogs,
  systemHealth,
} from './data/mock.js';
import { pnrs, getLiveBookings, getPassengerCount } from './data/passengerStore.js';
import { signToken, authMiddleware, requireRole } from './middleware/auth.js';
import passengersRouter from './routes/passengers.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let seatsCache = generateSeats();
const activityLog = [];

function logActivity(user, action, details) {
  activityLog.unshift({
    id: Date.now(),
    user: user?.name || 'System',
    action,
    details,
    time: new Date().toISOString(),
  });
  if (activityLog.length > 100) activityLog.pop();
}

function dashboardStats() {
  const count = getPassengerCount();
  return {
    ...dashboard,
    totalReservations: count,
    cancelledBookings: 0,
  };
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = password === user.password || (await bcrypt.compare(password, user.password));
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  logActivity(user, 'LOGIN', email);
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const live = getLiveBookings();
  res.json({
    stats: dashboardStats(),
    revenueChart,
    occupancyChart,
    flights,
    bookings: live.length ? live : [],
    heatmap,
    routes: [
      { from: 'JFK', to: 'LHR', volume: 450 },
      { from: 'DXB', to: 'SIN', volume: 380 },
      { from: 'LAX', to: 'NRT', volume: 320 },
      { from: 'CDG', to: 'FRA', volume: 290 },
      { from: 'SYD', to: 'MEL', volume: 210 },
    ],
  });
});

app.get('/api/bookings/live', authMiddleware, (req, res) => {
  res.json(getLiveBookings());
});

app.get('/api/pnr/search', authMiddleware, (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });
  const upper = q.toUpperCase();
  const results = Object.values(pnrs).filter(
    (p) =>
      p.pnr.includes(upper) ||
      p.passenger.name.toLowerCase().includes(q.toLowerCase())
  );
  res.json({ results });
});

app.get('/api/pnr/:code', authMiddleware, (req, res) => {
  const pnr = pnrs[req.params.code.toUpperCase()];
  if (!pnr) return res.status(404).json({ error: 'PNR not found' });
  res.json(pnr);
});

app.use('/api/passengers', passengersRouter);

app.get('/api/seats', authMiddleware, (req, res) => {
  res.json({ flight: 'SK101', aircraft: 'B787-9', seats: seatsCache });
});

app.patch('/api/seats/:seatId', authMiddleware, (req, res) => {
  const { seatId } = req.params;
  const { passengerName } = req.body;
  const seat = seatsCache.find((s) => s.id === seatId.toUpperCase());
  if (!seat) return res.status(404).json({ error: 'Seat not found' });
  if (seat.status === 'occupied') return res.status(400).json({ error: 'Seat already occupied' });
  seat.status = passengerName ? 'occupied' : 'available';
  seat.passenger = passengerName || null;
  logActivity(req.user, 'SEAT_ASSIGN', `${seatId} → ${passengerName || 'released'}`);
  res.json(seat);
});

app.get('/api/admin/users', authMiddleware, requireRole('admin'), (req, res) => {
  res.json(adminUsers);
});

app.get('/api/admin/audit', authMiddleware, requireRole('admin'), (req, res) => {
  res.json([...auditLogs, ...activityLog.slice(0, 10)]);
});

app.get('/api/admin/health', authMiddleware, requireRole('admin', 'operations'), (req, res) => {
  res.json(systemHealth);
});

app.get('/api/admin/analytics', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ revenueChart, occupancyChart, dashboard: dashboardStats() });
});

app.get('/api/activity', authMiddleware, (req, res) => {
  res.json(activityLog.slice(0, 20));
});

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'SkyPNR Pro API' }));

app.listen(PORT, () => {
  console.log(`SkyPNR Pro API running on http://localhost:${PORT}`);
  console.log('Routes: GET/POST /api/passengers, GET/DELETE /api/passengers/:id');
});
