import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthState, User } from "../types/auth";
import { authApi } from "../utils/api";

const LS_TOKEN = "SG_TOKEN";
const LS_USER = "SG_USER";

type AuthContextValue = {
  state: AuthState;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

function buildAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "X";
  return (a + b).toUpperCase();
}

function mapBackendUser(u: { id: number; name: string; email: string; role: string; status: string }): User {
  return {
    id: String(u.id),
    fullName: u.name,
    email: u.email,
    role: u.role as User["role"],
    status: u.status === "INACTIVE" ? "FROZEN" : (u.status as User["status"]),
    avatarInitials: buildAvatarInitials(u.name),
    passwordHash: "",
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LS_TOKEN));

  const [state, setState] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      if (raw) return { user: JSON.parse(raw) as User };
    } catch {
      // ignore
    }
    return { user: null };
  });

  const login: AuthContextValue["login"] = async (email, password) => {
    try {
      const { token: t, user: u } = await authApi.login(email, password);
      const user = mapBackendUser(u);

      localStorage.setItem(LS_TOKEN, t);
      localStorage.setItem(LS_USER, JSON.stringify(user));
      setToken(t);
      setState({ user });

      // Notifica a los demás contextos que hay sesión nueva
      window.dispatchEvent(new CustomEvent("sg:auth:login"));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenciales inválidas.";
      return { ok: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    setToken(null);
    setState({ user: null });
    window.dispatchEvent(new CustomEvent("sg:auth:logout"));
  };

  const value = useMemo(() => ({ state, token, login, logout }), [state, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
