import { Router } from 'express';
import {
  registerPassenger,
  deletePassenger,
  listPassengers,
  getPassengerRecord,
} from '../data/passengerStore.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

/** GET /api/passengers — list all registered passengers */
router.get('/', authMiddleware, (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  let list = listPassengers();
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.pnr.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }
  res.json(list);
});

/** POST /api/passengers — register a new passenger (saved to registered.json) */
router.post('/', authMiddleware, requireRole('admin', 'agent'), (req, res) => {
  try {
    const record = registerPassenger(req.body, req.user);
    res.status(201).json(record);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Registration failed' });
  }
});

/** GET /api/passengers/:id — single passenger record */
router.get('/:id', authMiddleware, (req, res) => {
  const record = getPassengerRecord(req.params.id);
  if (!record) return res.status(404).json({ error: 'Passenger not found' });
  res.json(record);
});

/** DELETE /api/passengers/:id — remove passenger (admin only) */
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const code = deletePassenger(req.params.id);
  if (!code) return res.status(404).json({ error: 'Passenger not found' });
  res.json({ ok: true, pnr: code });
});

export default router;
