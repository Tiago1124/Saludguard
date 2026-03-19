export type Role = "ADMIN" | "EPS" | "LAWYER";

// FROZEN = inactivo temporalmente, DELETED = eliminado (soft)
export type UserStatus = "ACTIVE" | "FROZEN" | "DELETED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarInitials: string;
  passwordHash: string; // vacío en sesión real (solo referencia interna)
}

export interface AuthState {
  user: User | null;
}
