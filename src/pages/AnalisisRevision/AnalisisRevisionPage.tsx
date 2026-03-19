import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useTutelas } from "../../context/TutelasContext";
import { useAuth } from "../../context/AuthContext";
import { routes } from "../../router/routes";
import type { TutelaCase, TutelaPriority, TutelaStage } from "../../types/tutela";

const PRIORITY_TONE: Record<TutelaPriority, "danger" | "warning" | "info" | "success"> = {
  CRITICA: "danger",
  ALTA: "warning",
  MEDIA: "info",
  BAJA: "success",
};

const PRIORITY_LABEL: Record<TutelaPriority, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

const STAGE_LABEL: Record<TutelaStage, string> = {
  RECEPCION: "Recepción",
  ANALISIS: "En Análisis",
  CONTESTACION: "Contestación",
  DOCUMENTAL: "Documental",
  FALLO: "Fallo",
  CERRADA: "Cerrada",
};

const NEXT_STAGE: Partial<Record<TutelaStage, TutelaStage>> = {
  RECEPCION: "ANALISIS",
  ANALISIS: "CONTESTACION",
  CONTESTACION: "DOCUMENTAL",
  DOCUMENTAL: "FALLO",
  FALLO: "CERRADA",
};

function horasRestantes(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Vencida";
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h restantes`;
  return `${Math.floor(h / 24)}d restantes`;
}

export default function AnalisisRevisionPage() {
  const { tutelas, updateTutela, assignTutela } = useTutelas();
  const { state } = useAuth();
  const user = state.user!;
  const nav = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [advancing, setAdvancing] = useState<string | null>(null);

  const activeTutelas = useMemo(() => {
    return tutelas
      .filter((t) => t.stage !== "CERRADA")
      .filter((t) => {
        const q = search.toLowerCase();
        if (q && !t.radicado.toLowerCase().includes(q) && !t.paciente.toLowerCase().includes(q) && !t.servicioSolicitado.toLowerCase().includes(q)) return false;
        if (filterStage && t.stage !== filterStage) return false;
        if (filterPriority && t.prioridad !== filterPriority) return false;
        return true;
      });
  }, [tutelas, search, filterStage, filterPriority]);

  const stats = useMemo(() => ({
    total: tutelas.filter(t => t.stage !== "CERRADA").length,
    recepcion: tutelas.filter(t => t.stage === "RECEPCION").length,
    analisis: tutelas.filter(t => t.stage === "ANALISIS").length,
    criticas: tutelas.filter(t => t.prioridad === "CRITICA" && t.stage !== "CERRADA").length,
    sinAsignar: tutelas.filter(t => !t.assignedToUserId && t.stage !== "CERRADA").length,
  }), [tutelas]);

  const handleAvanzar = async (t: TutelaCase) => {
    const next = NEXT_STAGE[t.stage];
    if (!next) return;
    setAdvancing(t.id);
    await updateTutela(t.id, { stage: next });
    setAdvancing(null);
  };

  const handleAutoAsignar = async (t: TutelaCase) => {
    if (t.assignedToUserId) return;
    await assignTutela(t.id, user.id);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
      <div style={{ display: "grid", gap: 12 }}>
        {/* Filtros */}
        <Card>
          <div style={{ padding: 14, display: "grid", gap: 10 }}>
            <Input
              placeholder="Buscar por radicado, paciente, servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="">Todas las etapas</option>
                <option value="RECEPCION">Recepción</option>
                <option value="ANALISIS">En Análisis</option>
                <option value="CONTESTACION">Contestación</option>
                <option value="DOCUMENTAL">Documental</option>
                <option value="FALLO">Fallo</option>
              </Select>
              <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="">Toda prioridad</option>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </Select>
              <Button variant="outline" onClick={() => { setSearch(""); setFilterStage(""); setFilterPriority(""); }}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de casos */}
        <Card>
          <div style={{ padding: "14px 14px 0", fontWeight: 900, fontSize: 16 }}>
            Casos ({activeTutelas.length})
          </div>
          <div style={{ padding: "10px 14px 14px", display: "grid", gap: 12 }}>
            {activeTutelas.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, padding: 8 }}>
                No hay casos que coincidan con los filtros.
              </div>
            )}
            {activeTutelas.map((t) => (
              <div key={t.id} style={{ border: "1px solid #dfe5ee", borderRadius: 12, padding: 14, background: "#f7fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{t.radicado}</div>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{t.paciente}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge tone={PRIORITY_TONE[t.prioridad]}>{PRIORITY_LABEL[t.prioridad]}</Badge>
                    <Badge tone="neutral">{STAGE_LABEL[t.stage]}</Badge>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>Servicio</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.servicioSolicitado || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>Asignado a</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {t.assignedToUserId ? (t.assignedToUserId === user.id ? "Yo" : `Usuario #${t.assignedToUserId}`) : "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>Término</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.terminoRespuesta && new Date(t.terminoRespuesta) < new Date() ? "#dc2626" : "inherit" }}>
                      {t.terminoRespuesta ? horasRestantes(t.terminoRespuesta) : "—"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {!t.assignedToUserId && (
                    <Button size="sm" variant="outline" onClick={() => handleAutoAsignar(t)}>
                      Asignarme
                    </Button>
                  )}
                  {NEXT_STAGE[t.stage] && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAvanzar(t)}
                      disabled={advancing === t.id}
                    >
                      {advancing === t.id ? "…" : `Avanzar a ${STAGE_LABEL[NEXT_STAGE[t.stage]!]}`}
                    </Button>
                  )}
                  {t.stage === "ANALISIS" && (
                    <Button size="sm" variant="outline" onClick={() => nav(routes.contestaciones)}>
                      Contestar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Panel lateral */}
      <Card>
        <div style={{ padding: 14, fontWeight: 900 }}>Estadísticas</div>
        <div style={{ padding: "0 14px 14px", display: "grid", gap: 10 }}>
          {[
            ["Total activas", stats.total],
            ["En recepción", stats.recepcion],
            ["En análisis", stats.analisis],
            ["Críticas", stats.criticas],
            ["Sin asignar", stats.sinAsignar],
          ].map(([label, val]) => (
            <div key={String(label)} style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{label}</div>
              <div style={{ fontWeight: 900 }}>{val}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
