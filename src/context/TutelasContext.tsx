import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";
import type { DocumentItem, TutelaCase, TutelaPriority, TutelaStage } from "../types/tutela";
import { tutelaApi, type BackendTutela } from "../utils/api";

type TutelasContextValue = {
  tutelas: TutelaCase[];
  docs: DocumentItem[];
  isLoading: boolean;
  createTutela: (payload: Omit<TutelaCase, "id" | "receivedAt" | "stage">) => Promise<void>;
  updateTutela: (id: string, patch: Partial<TutelaCase>) => Promise<void>;
  assignTutela: (tutelaId: string, userId: string) => Promise<void>;
  selfAssignTutela: (tutelaId: string, userId: string) => Promise<void>;
  countBy: (predicate: (t: TutelaCase) => boolean) => number;
  stageCount: (stage: TutelaStage) => number;
  priorityCount: (p: TutelaPriority) => number;
};

function mapTutela(t: BackendTutela): TutelaCase {
  return {
    id: String(t.id),
    radicado: t.radicado ?? "",
    paciente: t.paciente ?? "",
    juzgado: t.juzgado ?? "",
    fechaNotificacion: t.fechaNotificacion ?? t.receivedAt ?? "",
    terminoRespuesta: t.terminoRespuesta ?? "",
    servicioSolicitado: t.servicioSolicitado ?? "",
    derechoVulnerado: t.derechoVulnerado ?? "",
    prioridad: (t.prioridad ?? "MEDIA") as TutelaPriority,
    observaciones: t.observaciones ?? undefined,
    stage: (t.stage ?? "RECEPCION") as TutelaStage,
    assignedToUserId: t.assignedToUserId != null ? String(t.assignedToUserId) : undefined,
    receivedAt: t.receivedAt ?? new Date().toISOString(),
  };
}

const TutelasContext = createContext<TutelasContextValue | null>(null);

export function TutelasProvider({ children }: { children: React.ReactNode }) {
  const [tutelas, setTutelas] = useState<TutelaCase[]>([]);
  const [docs] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTutelas = useCallback(async () => {
    const hasToken = Boolean(localStorage.getItem("SG_TOKEN"));
    if (!hasToken) return;
    try {
      setIsLoading(true);
      const data = await tutelaApi.list();
      setTutelas(data.map(mapTutela));
    } catch {
      // token inválido o backend caído — ignorar silenciosamente
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutelas();

    const onLogin = () => fetchTutelas();
    const onLogout = () => setTutelas([]);
    window.addEventListener("sg:auth:login", onLogin);
    window.addEventListener("sg:auth:logout", onLogout);
    return () => {
      window.removeEventListener("sg:auth:login", onLogin);
      window.removeEventListener("sg:auth:logout", onLogout);
    };
  }, [fetchTutelas]);

  const createTutela = async (payload: Omit<TutelaCase, "id" | "receivedAt" | "stage">) => {
    const created = await tutelaApi.create(payload as Partial<BackendTutela>);
    setTutelas(prev => [mapTutela(created), ...prev]);
  };

  const updateTutela = async (id: string, patch: Partial<TutelaCase>) => {
    const updated = await tutelaApi.update(id, patch as Partial<BackendTutela>);
    setTutelas(prev => prev.map(t => t.id === id ? mapTutela(updated) : t));
  };

  const assignTutela = async (tutelaId: string, userId: string) => {
    await tutelaApi.assign(tutelaId, userId);
    setTutelas(prev =>
      prev.map(t => t.id === tutelaId ? { ...t, assignedToUserId: userId } : t)
    );
  };

  const selfAssignTutela = async (tutelaId: string, userId: string) => {
    const tutela = tutelas.find(t => t.id === tutelaId);
    if (tutela?.assignedToUserId) return;
    await assignTutela(tutelaId, userId);
  };

  const countBy = (predicate: (t: TutelaCase) => boolean) => tutelas.filter(predicate).length;
  const stageCount = (stage: TutelaStage) => tutelas.filter(t => t.stage === stage).length;
  const priorityCount = (p: TutelaPriority) => tutelas.filter(t => t.prioridad === p).length;

  const value = useMemo(
    () => ({
      tutelas, docs, isLoading,
      createTutela, updateTutela, assignTutela, selfAssignTutela,
      countBy, stageCount, priorityCount,
    }),
    [tutelas, docs, isLoading]
  );

  return <TutelasContext.Provider value={value}>{children}</TutelasContext.Provider>;
}

export function useTutelas() {
  const ctx = useContext(TutelasContext);
  if (!ctx) throw new Error("useTutelas debe usarse dentro de TutelasProvider");
  return ctx;
}
