import bcrypt from 'bcryptjs';
import dbPromise from './db.js';

async function migrate() {
  const db = await dbPromise;

  // Recrea el schema desde cero
  await db.exec('DROP TABLE IF EXISTS documents');
  await db.exec('DROP TABLE IF EXISTS tutelas');
  await db.exec('DROP TABLE IF EXISTS users');

  await db.exec(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
  )`);

  await db.exec(`CREATE TABLE tutelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    radicado TEXT,
    paciente TEXT,
    juzgado TEXT,
    fechaNotificacion TEXT,
    terminoRespuesta TEXT,
    servicioSolicitado TEXT,
    derechoVulnerado TEXT,
    prioridad TEXT NOT NULL DEFAULT 'MEDIA',
    observaciones TEXT,
    stage TEXT NOT NULL DEFAULT 'RECEPCION',
    assignedToUserId INTEGER,
    receivedAt TEXT,
    FOREIGN KEY (assignedToUserId) REFERENCES users(id)
  )`);

  await db.exec(`CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutelaId INTEGER,
    fileName TEXT NOT NULL,
    tipo TEXT,
    sizeLabel TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVO',
    tags TEXT,
    modifiedAt TEXT,
    uploadedAt TEXT,
    FOREIGN KEY (tutelaId) REFERENCES tutelas(id)
  )`);

  // Seed usuarios demo
  const demoUsers = [
    { name: 'Admin', email: 'admin@demo.com', password: '123456', role: 'ADMIN' },
    { name: 'EPS Demo', email: 'eps@demo.com', password: '123456', role: 'EPS' },
    { name: 'Abogado Demo', email: 'abogado@demo.com', password: '123456', role: 'LAWYER' },
  ];

  for (const u of demoUsers) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.run(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      u.name, u.email, hash, u.role, 'ACTIVE'
    );
  }

  // Seed tutelas de ejemplo
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO tutelas (radicado, paciente, juzgado, fechaNotificacion, terminoRespuesta, servicioSolicitado, derechoVulnerado, prioridad, observaciones, stage, receivedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'T-2024-001234', 'Juan Pérez García', 'Juzgado 15 Civil Municipal',
    '2024-01-18T14:00:00.000Z', '2024-01-28T18:00:00.000Z',
    'Cirugía cardiovascular', 'Vida digna', 'CRITICA',
    'Requiere contestación urgente.', 'ANALISIS', now
  );
  await db.run(
    `INSERT INTO tutelas (radicado, paciente, juzgado, fechaNotificacion, terminoRespuesta, servicioSolicitado, derechoVulnerado, prioridad, stage, receivedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'T-2024-001239', 'Carlos Mendoza', 'Juzgado 8 Civil del Circuito',
    '2024-01-18T12:30:00.000Z', '2024-01-30T18:00:00.000Z',
    'Resonancia magnética', 'Salud', 'ALTA', 'RECEPCION', now
  );

  console.log('✅ Migración y seed completados.');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
