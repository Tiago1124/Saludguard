# SaludGuard — Documentación de Desarrollo

## Estado actual: MVP Funcional ✅

El frontend y el backend están completamente integrados. Los datos se persisten en SQLite a través de una API REST con autenticación JWT.

---

## Cómo correr el proyecto

### Opción 1: Local (recomendado para desarrollo)

**Backend (puerto 4000):**
```bash
cd backend
npm install
node src/utils/migrate.js   # Solo la primera vez (crea DB + seed)
npm run dev                  # Inicia con nodemon (auto-reload)
```

**Frontend (puerto 5173):**
```bash
# Desde la raíz del proyecto
npm install
npm run dev
```

Abre: http://localhost:5173

### Opción 2: Docker

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:4000

---

## Credenciales de demo

Todas con contraseña **`123456`**:

| Email | Rol | Permisos |
|---|---|---|
| admin@demo.com | ADMIN | Todo: gestión de usuarios, tutelas, asignación |
| eps@demo.com | EPS | Tutelas, asignación, ver usuarios |
| abogado@demo.com | LAWYER | Tutelas propias, auto-asignación |

---

## Arquitectura

```
saludguard/
├── src/                    # Frontend (React + TypeScript + Vite)
│   ├── context/
│   │   ├── AuthContext.tsx       # Login/logout → POST /api/auth/login
│   │   ├── TutelasContext.tsx    # CRUD tutelas → /api/tutelas
│   │   └── UsersContext.tsx      # CRUD usuarios → /api/users
│   ├── utils/
│   │   └── api.ts               # Cliente HTTP (fetch + JWT)
│   ├── types/
│   │   ├── auth.ts              # Role, UserStatus, User, AuthState
│   │   └── tutela.ts            # TutelaCase, DocumentItem, enums
│   └── pages/                  # Una página por módulo
│
└── backend/                # API REST (Node.js + Express + SQLite)
    └── src/
        ├── routes/
        │   ├── authRoutes.js    # POST /api/auth/login
        │   ├── tutelaRoutes.js  # GET/POST /api/tutelas, PATCH /:id, /:id/assign
        │   ├── userRoutes.js    # GET/POST /api/users, PATCH /:id
        │   └── documentRoutes.js
        ├── middleware/
        │   └── auth.js          # authenticateToken, authorizeRoles
        └── utils/
            ├── db.js            # Conexión SQLite
            └── migrate.js       # Schema + seed inicial
```

---

## API Reference

### Auth
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /api/auth/login | Login, devuelve JWT | ❌ |

### Tutelas
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/tutelas | Listar todas | ✅ |
| GET | /api/tutelas/:id | Obtener una | ✅ |
| POST | /api/tutelas | Crear nueva | ✅ |
| PATCH | /api/tutelas/:id | Actualizar campos | ✅ |
| PATCH | /api/tutelas/:id/assign | Asignar a usuario | ✅ |

### Usuarios
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/users | Listar usuarios | ADMIN/EPS |
| POST | /api/users | Crear usuario | ADMIN |
| PATCH | /api/users/:id | Actualizar rol/estado | ADMIN |

### Documentos
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /api/documents/tutela/:tutelaId | Docs de una tutela | ✅ |
| POST | /api/documents | Registrar documento | ✅ |

---

## Esquema de Base de Datos (SQLite)

```sql
-- Usuarios
CREATE TABLE users (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- bcrypt hash
  role     TEXT NOT NULL,          -- ADMIN | EPS | LAWYER
  status   TEXT NOT NULL DEFAULT 'ACTIVE'  -- ACTIVE | INACTIVE | DELETED
);

-- Tutelas
CREATE TABLE tutelas (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  radicado            TEXT,
  paciente            TEXT,
  juzgado             TEXT,
  fechaNotificacion   TEXT,        -- ISO 8601
  terminoRespuesta    TEXT,        -- ISO 8601
  servicioSolicitado  TEXT,
  derechoVulnerado    TEXT,
  prioridad           TEXT DEFAULT 'MEDIA',  -- BAJA|MEDIA|ALTA|CRITICA
  observaciones       TEXT,
  stage               TEXT DEFAULT 'RECEPCION',
  assignedToUserId    INTEGER REFERENCES users(id),
  receivedAt          TEXT
);

-- Documentos
CREATE TABLE documents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tutelaId   INTEGER REFERENCES tutelas(id),
  fileName   TEXT NOT NULL,
  tipo       TEXT,   -- HISTORIA_CLINICA|AUTORIZACION|ACTA_COMITE|PQR|CONTESTACION|FALLO
  sizeLabel  TEXT,
  status     TEXT DEFAULT 'ACTIVO',  -- ACTIVO|APROBADO|EN_REVISION
  tags       TEXT,                   -- JSON array como string
  modifiedAt TEXT,
  uploadedAt TEXT
);
```

---

## Flujo de autenticación

1. Usuario introduce email/contraseña en `/login`
2. Frontend llama `POST /api/auth/login`
3. Backend valida contra DB con bcrypt, devuelve JWT (8h)
4. Token se guarda en `localStorage` como `SG_TOKEN`
5. Todos los requests siguientes incluyen `Authorization: Bearer <token>`
6. Al login exitoso se dispara el evento custom `sg:auth:login`
7. `TutelasContext` y `UsersContext` escuchan ese evento y hacen fetch inicial

---

## Roles y permisos

| Acción | ADMIN | EPS | LAWYER |
|---|---|---|---|
| Ver tutelas | ✅ | ✅ | ✅ |
| Crear tutela | ✅ | ✅ | ✅ |
| Asignar tutela a otro | ✅ | ✅ | ❌ |
| Auto-asignarse tutela | ✅ | ✅ | ✅ |
| Ver lista de usuarios | ✅ | ✅ | ❌ |
| Crear usuario | ✅ | ❌ | ❌ |
| Cambiar rol/estado | ✅ | ❌ | ❌ |

---

## Variables de entorno

### Backend (`backend/.env`)
```
JWT_SECRET=supersecretkey
PORT=4000
DATABASE_URL=./db.sqlite3
```

### Frontend (solo Docker/producción)
```
VITE_API_TARGET=http://backend:4000   # URL interna del backend en Docker
```
En desarrollo local no es necesario: el proxy de Vite apunta a `http://localhost:4000` por defecto.

---

## Páginas implementadas

| Página | Ruta | Estado |
|---|---|---|
| Login | /login | ✅ Funcional (API real) |
| Dashboard | /dashboard | ✅ Métricas de tutelas reales |
| Recepción | /recepcion | ✅ Crea tutelas en DB |
| Análisis/Revisión | /analisis | ⚠️ UI lista, sin edición de stage |
| Contestaciones | /contestaciones | 🚧 En construcción |
| Gestión Documental | /documental | 🚧 En construcción |
| Alertas | /alertas | ⚠️ UI lista, datos hardcoded |
| Reportes | /reportes | 🚧 En construcción |
| Cumplimiento | /cumplimiento | 🚧 En construcción |
| Centro Recursos | /recursos | 🚧 En construcción |
| Gestión Usuarios | /usuarios | ✅ CRUD real (solo ADMIN/EPS) |
| Perfil | /perfil | ⚠️ Lectura OK, edición local |

---

## Próximos pasos para completar el MVP

1. **Página Análisis/Revisión**: Conectar botón de cambio de stage → `updateTutela({ stage: 'ANALISIS' })`
2. **Página Alertas**: Calcular fechas reales desde `tutelas.terminoRespuesta`
3. **Gestión Documental**: Implementar upload de archivos (multer en backend)
4. **Contestaciones**: Formulario + guardado en `documents` con tipo `CONTESTACION`
5. **Reportes**: Usar `countBy`, `stageCount`, `priorityCount` del contexto
6. **Perfil**: Llamar `PATCH /api/users/:id` para guardar cambios

---

## Notas técnicas

- **Mapeo de IDs**: SQLite devuelve `id` como integer; el frontend los trata como `string` vía `String(t.id)`.
- **Estado FROZEN**: El frontend usa `"FROZEN"` como estado de usuario suspendido; el backend lo almacena como `"INACTIVE"`. El mapeo ocurre en `UsersContext`.
- **Evento sg:auth:login**: Al hacer login, `AuthContext` dispara este evento custom. `TutelasContext` y `UsersContext` lo escuchan para hacer el fetch inicial sin crear dependencias circulares entre contextos.
- **Re-migración**: Correr `node src/utils/migrate.js` **borra todos los datos** y recrea el schema. Solo usar en desarrollo.
