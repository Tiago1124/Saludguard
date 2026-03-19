import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";
import type { Role, User, UserStatus } from "../types/auth";
import { userApi, type BackendUser } from "../utils/api";

type UsersContextValue = {
  users: User[];
  isLoading: boolean;
  addUser: (payload: {
    fullName: string; email: string; role: Role; password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  setStatus: (id: string, status: UserStatus) => Promise<void>;
  updateUser: (id: string, patch: Partial<Pick<User, "fullName" | "email" | "role">>) => Promise<void>;
};

function buildAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "X";
  return (a + b).toUpperCase();
}

function mapUser(u: BackendUser): User {
  return {
    id: String(u.id),
    fullName: u.name,
    email: u.email,
    role: u.role as Role,
    // El backend usa INACTIVE; el frontend lo muestra como FROZEN
    status: u.status === "INACTIVE" ? "FROZEN" : (u.status as UserStatus),
    avatarInitials: buildAvatarInitials(u.name),
    passwordHash: "",
  };
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const hasToken = Boolean(localStorage.getItem("SG_TOKEN"));
    if (!hasToken) return;
    try {
      setIsLoading(true);
      const data = await userApi.list();
      setUsers(data.map(mapUser));
    } catch {
      // puede fallar si el rol no tiene permiso (LAWYER) — ignorar
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    const onLogin = () => fetchUsers();
    const onLogout = () => setUsers([]);
    window.addEventListener("sg:auth:login", onLogin);
    window.addEventListener("sg:auth:logout", onLogout);
    return () => {
      window.removeEventListener("sg:auth:login", onLogin);
      window.removeEventListener("sg:auth:logout", onLogout);
    };
  }, [fetchUsers]);

  const addUser = async (payload: {
    fullName: string; email: string; role: Role; password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const created = await userApi.create({
        name: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
      setUsers(prev => [mapUser(created), ...prev]);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario.";
      return { ok: false, error: msg };
    }
  };

  const setStatus = async (id: string, status: UserStatus) => {
    // FROZEN → INACTIVE para el backend
    const backendStatus = status === "FROZEN" ? "INACTIVE" : status;
    await userApi.update(id, { status: backendStatus });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const updateUser = async (
    id: string,
    patch: Partial<Pick<User, "fullName" | "email" | "role">>
  ) => {
    const backendPatch: Partial<BackendUser> = {};
    if (patch.fullName) backendPatch.name = patch.fullName;
    if (patch.email) backendPatch.email = patch.email;
    if (patch.role) backendPatch.role = patch.role;

    await userApi.update(id, backendPatch);
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, ...patch, avatarInitials: patch.fullName ? buildAvatarInitials(patch.fullName) : u.avatarInitials }
          : u
      )
    );
  };

  const value = useMemo(
    () => ({ users, isLoading, addUser, setStatus, updateUser }),
    [users, isLoading]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers debe usarse dentro de UsersProvider");
  return ctx;
}
