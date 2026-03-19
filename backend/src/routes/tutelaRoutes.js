import express from 'express';
import dbPromise from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET / - Listar todas las tutelas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const tutelas = await db.all('SELECT * FROM tutelas ORDER BY receivedAt DESC');
    res.json(tutelas);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /:id - Obtener una tutela
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const tutela = await db.get('SELECT * FROM tutelas WHERE id = ?', req.params.id);
    if (!tutela) return res.status(404).json({ error: 'Tutela no encontrada' });
    res.json(tutela);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST / - Crear tutela
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      radicado, paciente, juzgado, fechaNotificacion, terminoRespuesta,
      servicioSolicitado, derechoVulnerado, prioridad, observaciones
    } = req.body;

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO tutelas
        (radicado, paciente, juzgado, fechaNotificacion, terminoRespuesta,
         servicioSolicitado, derechoVulnerado, prioridad, observaciones, stage, receivedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEPCION', ?)`,
      radicado, paciente, juzgado, fechaNotificacion, terminoRespuesta,
      servicioSolicitado, derechoVulnerado, prioridad ?? 'MEDIA',
      observaciones ?? null, new Date().toISOString()
    );
    const created = await db.get('SELECT * FROM tutelas WHERE id = ?', result.lastID);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /:id - Actualizar campos de tutela
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      stage, prioridad, observaciones,
      radicado, paciente, juzgado, fechaNotificacion,
      terminoRespuesta, servicioSolicitado, derechoVulnerado
    } = req.body;

    const db = await dbPromise;
    await db.run(
      `UPDATE tutelas SET
        stage              = COALESCE(?, stage),
        prioridad          = COALESCE(?, prioridad),
        observaciones      = COALESCE(?, observaciones),
        radicado           = COALESCE(?, radicado),
        paciente           = COALESCE(?, paciente),
        juzgado            = COALESCE(?, juzgado),
        fechaNotificacion  = COALESCE(?, fechaNotificacion),
        terminoRespuesta   = COALESCE(?, terminoRespuesta),
        servicioSolicitado = COALESCE(?, servicioSolicitado),
        derechoVulnerado   = COALESCE(?, derechoVulnerado)
       WHERE id = ?`,
      stage ?? null, prioridad ?? null, observaciones ?? null,
      radicado ?? null, paciente ?? null, juzgado ?? null,
      fechaNotificacion ?? null, terminoRespuesta ?? null,
      servicioSolicitado ?? null, derechoVulnerado ?? null,
      req.params.id
    );
    const updated = await db.get('SELECT * FROM tutelas WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /:id/assign - Asignar tutela a usuario
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const db = await dbPromise;
    await db.run('UPDATE tutelas SET assignedToUserId = ? WHERE id = ?', userId, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
