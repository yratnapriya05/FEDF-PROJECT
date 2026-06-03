export const users = [
  { id: 1, email: 'admin@skypnr.com', password: 'admin123', role: 'admin', name: 'Alex Morgan' },
  { id: 2, email: 'agent@skypnr.com', password: 'agent123', role: 'agent', name: 'Sarah Chen' },
  { id: 3, email: 'ops@skypnr.com', password: 'ops123', role: 'operations', name: 'James Wright' },
];

export const dashboard = {
  totalReservations: 2847,
  todayFlights: 42,
  occupancyRate: 87.4,
  cancelledBookings: 23,
  delayedFlights: 5,
  revenue: 1248500,
  revenueChange: 12.4,
  liveIndicator: true,
};

export const revenueChart = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: [890000, 1020000, 980000, 1150000, 1180000, 1248500],
};

export const occupancyChart = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [82, 85, 88, 91, 94, 96, 87],
};

export const flights = [
  { id: 'SK101', route: 'JFK → LHR', dep: '08:30', arr: '20:15', status: 'On Time', aircraft: 'B787-9', occupancy: 92 },
  { id: 'SK204', route: 'DXB → SIN', dep: '14:00', arr: '01:45+1', status: 'Delayed', aircraft: 'A380', occupancy: 88 },
  { id: 'SK318', route: 'LAX → NRT', dep: '11:20', arr: '15:10+1', status: 'Boarding', aircraft: 'B777-300', occupancy: 95 },
  { id: 'SK445', route: 'CDG → FRA', dep: '16:45', arr: '18:00', status: 'On Time', aircraft: 'A320neo', occupancy: 78 },
  { id: 'SK512', route: 'SYD → MEL', dep: '07:00', arr: '08:35', status: 'Departed', aircraft: 'B737-800', occupancy: 84 },
];

/** Live bookings are built from registered passengers — see passengerStore.js */
export const bookings = [];

export const heatmap = Array.from({ length: 30 }, (_, i) => ({
  row: Math.floor(i / 6),
  col: i % 6,
  value: Math.floor(Math.random() * 40) + 60,
}));

export function generateSeats() {
  const seats = [];
  const rows = { business: [1, 2, 3], premium: [4, 5, 6, 7], economy: Array.from({ length: 20 }, (_, i) => i + 8) };
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  const occupied = new Set(['1A', '1C', '2B', '4A', '4F', '8C', '12A', '15D']);

  for (const [cabin, rowList] of Object.entries(rows)) {
    for (const row of rowList) {
      for (const col of cols) {
        if (cabin === 'business' && ['B', 'E'].includes(col)) continue;
        const id = `${row}${col}`;
        seats.push({
          id,
          row,
          col,
          cabin,
          status: occupied.has(id) ? 'occupied' : Math.random() > 0.85 ? 'blocked' : 'available',
          passenger: occupied.has(id) ? 'Assigned' : null,
        });
      }
    }
  }
  return seats;
}

export const adminUsers = [
  { id: 1, name: 'Alex Morgan', email: 'admin@skypnr.com', role: 'admin', status: 'active', lastLogin: '2026-06-03 08:00' },
  { id: 2, name: 'Sarah Chen', email: 'agent@skypnr.com', role: 'agent', status: 'active', lastLogin: '2026-06-03 07:45' },
  { id: 3, name: 'James Wright', email: 'ops@skypnr.com', role: 'operations', status: 'active', lastLogin: '2026-06-02 22:30' },
];

export const auditLogs = [
  { id: 1, user: 'Alex Morgan', action: 'User role updated', target: 'agent@skypnr.com', time: '2026-06-03 09:15' },
  { id: 2, user: 'Sarah Chen', action: 'PNR modified', target: 'ABC123', time: '2026-06-03 08:42' },
  { id: 3, user: 'James Wright', action: 'Seat reassigned', target: 'SK101-12A', time: '2026-06-03 08:30' },
  { id: 4, user: 'Alex Morgan', action: 'Report exported', target: 'revenue-june', time: '2026-06-02 17:00' },
];

export const systemHealth = {
  api: 99.9,
  database: 98.5,
  queue: 100,
  uptime: '99.97%',
};
