import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'registered.json');

/** @type {Record<string, object>} */
export const pnrs = {};

let nextId = 1;

function nowStr() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function generatePnr() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (pnrs[code]);
  return code;
}

function avatarFor(name) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function save() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ nextId, records: Object.values(pnrs) }, null, 2)
  );
}

function load() {
  if (!fs.existsSync(DATA_FILE)) return;
  try {
    const { nextId: savedId, records } = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (savedId) nextId = savedId;
    for (const record of records || []) {
      pnrs[record.pnr] = record;
    }
  } catch {
    /* start fresh */
  }
}

load();

export function registerPassenger({ name, email, phone, flightNumber, route, travelClass }, registeredBy) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Passenger name is required');

  const pnr = generatePnr();
  const id = nextId++;
  const time = nowStr();

  const record = {
    pnr,
    status: 'Confirmed',
    registeredBy: registeredBy?.name || 'Admin',
    passenger: {
      id,
      name: trimmed,
      email: email?.trim() || `${trimmed.toLowerCase().replace(/\s+/g, '.')}@guest.skypnr.com`,
      phone: phone?.trim() || '—',
      passport: '—',
      tier: 'Standard',
      avatar: avatarFor(trimmed),
      ssr: [],
    },
    flight: {
      number: flightNumber?.trim() || 'SK101',
      route: route?.trim() || 'JFK → LHR',
      date: new Date().toISOString().slice(0, 10),
      seat: '—',
      class: travelClass?.trim() || 'Economy',
    },
    timeline: [
      { time, event: 'Passenger registered', location: `By ${registeredBy?.name || 'Admin'}` },
    ],
    history: [],
  };

  pnrs[pnr] = record;
  save();
  return record;
}

export function deletePassenger(id) {
  const entry = Object.entries(pnrs).find(([, p]) => p.passenger.id === Number(id));
  if (!entry) return null;
  const [code] = entry;
  delete pnrs[code];
  save();
  return code;
}

export function listPassengers() {
  return Object.values(pnrs).map((p) => ({
    id: p.passenger.id,
    name: p.passenger.name,
    email: p.passenger.email,
    pnr: p.pnr,
    status: p.status,
    tier: p.passenger.tier,
    avatar: p.passenger.avatar,
    flight: p.flight.number,
    route: p.flight.route,
    seat: p.flight.seat,
    class: p.flight.class,
    registeredBy: p.registeredBy,
  }));
}

export function getPassengerRecord(id) {
  return Object.values(pnrs).find((p) => p.passenger.id === Number(id)) || null;
}

export function getLiveBookings() {
  return Object.values(pnrs)
    .slice(-10)
    .reverse()
    .map((p, i) => ({
      id: p.passenger.id,
      pnr: p.pnr,
      passenger: p.passenger.name,
      route: p.flight.route.replace(/\s*→\s*/g, '-').replace(/\s/g, ''),
      status: p.status,
      time: i === 0 ? 'Just now' : `${i + 1} min ago`,
    }));
}

export function getPassengerCount() {
  return Object.keys(pnrs).length;
}
