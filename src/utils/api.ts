// Cliente HTTP para el backend de SaludGuard
// Todas las rutas son relativas a /api — el proxy de Vite las redirige a http://localhost:4000

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('SG_TOKEN');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  return res.json();
}

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// --- Tutelas ---
export const tutelaApi = {
  list: () => request<BackendTutela[]>('/tutelas'),
  get: (id: string | number) => request<BackendTutela>(`/tutelas/${id}`),
  create: (data: Partial<BackendTutela>) =>
    request<BackendTutela>('/tutelas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, patch: Partial<BackendTutela>) =>
    request<BackendTutela>(`/tutelas/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  assign: (id: string | number, userId: string | number) =>
    request<{ ok: boolean }>(`/tutelas/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    }),
};

// --- Usuarios ---
export const userApi = {
  list: () => request<BackendUser[]>('/users'),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    request<BackendUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, patch: Partial<BackendUser & { status: string }>) =>
    request<BackendUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
};

// --- Documentos ---
export const documentApi = {
  listByTutela: (tutelaId: string | number) =>
    request<BackendDocument[]>(`/documents/tutela/${tutelaId}`),
  create: (data: Partial<BackendDocument>) =>
    request<BackendDocument>('/documents', { method: 'POST', body: JSON.stringify(data) }),
};

// ---- Tipos de respuesta del backend ----
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface BackendTutela {
  id: number;
  radicado: string;
  paciente: string;
  juzgado: string;
  fechaNotificacion: string;
  terminoRespuesta: string;
  servicioSolicitado: string;
  derechoVulnerado: string;
  prioridad: string;
  observaciones: string | null;
  stage: string;
  assignedToUserId: number | null;
  receivedAt: string;
}

export interface BackendDocument {
  id: number;
  tutelaId: number | null;
  fileName: string;
  tipo: string | null;
  sizeLabel: string | null;
  status: string;
  tags: string | null;
  modifiedAt: string | null;
  uploadedAt: string | null;
}
