# SkyPNR Pro

Premium airline operations dashboard — control center UI with analytics, PNR search, seat maps, and admin panel.

## Quick start (2 terminals)

**Terminal 1 — API**
```bash
cd server
npm run dev
```

**Terminal 2 — UI**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

**Important:** Run the API from the `server` folder (`cd server && npm run dev`). If you see `Cannot GET /api/passengers`, an old process is still on port 3001 — stop it and restart.

Passenger routes live in **`server/routes/passengers.js`** (mounted from **`server/index.js`**).

```bash
# Test API (login required for /api/passengers)
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skypnr.com","password":"admin123"}'
# Use the token from the response:
curl http://localhost:3001/api/passengers -H "Authorization: Bearer YOUR_TOKEN"
```

## Demo login

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@skypnr.com   | admin123  |
| Agent | agent@skypnr.com   | agent123  |

## Try these features

- **Dashboard** — stats, Chart.js charts, live bookings, route map, heatmap
- **Passengers** — admin registers by name (PNR auto-generated); list starts empty
- **PNR Search** — find anyone you registered
- **Seat Map** — click a green seat, enter a name, assign
- **Passengers** — profile, SSR badges, travel history
- **Admin** — users, audit logs, analytics (admin only)

## Stack

- React + Vite + Tailwind + Framer Motion + Chart.js
- Express + JWT (mock data — no MySQL required to run)
