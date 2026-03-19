import express from 'express';
import bcrypt from 'bcryptjs';
import dbPromise from '../utils/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET / - Listar usuarios activos (ADMIN o EPS)
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'EPS'), async (req, res) => {
  try {
    const db = await dbPromise;
    const users = await db.all(
      "SELECT id, name, email, role, status FROM users WHERE status != 'DELETED'"
    );
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST / - Crear usuario (solo ADMIN)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      name, email, hash, role, 'ACTIVE'
    );
    const created = await db.get(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      result.lastID
    );
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /:id - Actualizar estado o rol (solo ADMIN)
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { status, role, name, email } = req.body;
    const db = await dbPromise;
    await db.run(
      `UPDATE users SET
        status = COALESCE(?, status),
        role   = COALESCE(?, role),
        name   = COALESCE(?, name),
        email  = COALESCE(?, email)
       WHERE id = ?`,
      status ?? null, role ?? null, name ?? null, email ?? null, req.params.id
    );
    const updated = await db.get(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      req.params.id
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
