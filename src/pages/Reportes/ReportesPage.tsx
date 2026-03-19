import { useMemo } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useTutelas } from "../../context/TutelasContext";
import type { TutelaStage, TutelaPriority } from "../../types/tutela";

const STAGE_LABEL: Record<TutelaStage, string> = {
  RECEPCION: "Recepción",
  ANALISIS: "En Análisis",
  CONTESTACION: "Contestación",
  DOCUMENTAL: "Documental",
  FALLO: "Fallo",
  CERRADA: "Cerrada",
};

const PRIORITY_TONE: Record<TutelaPriority, string> = {
  CRITICA: "#dc2626",
  ALTA: "#d97706",
  MEDIA: "#2563eb",
  BAJA: "#16a34a",
};

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700 }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .3s" }} />
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const { tutelas, stageCount, priorityCount } = useTutelas();

  const stats = useMemo(() => {
    const total = tutelas.length;
    const activas = tutelas.filter((t) => t.stage !== "CERRADA").length;
    const cerradas = stageCount("CERRADA");
    const criticas = priorityCount("CRITICA");
    const vencidas = tutelas.filter((t) => t.terminoRespuesta && new Date(t.terminoRespuesta) < new Date() && t.stage !== "CERRADA").length;
    const sinAsignar = tutelas.filter((t) => !t.assignedToUserId && t.stage !== "CERRADA").length;
    return { total, activas, cerradas, criticas, vencidas, sinAsignar };
  }, [tutelas]);

  const stages: TutelaStage[] = ["RECEPCION", "ANALISIS", "CONTESTACION", "DOCUMENTAL", "FALLO", "CERRADA"];
  const priorities: TutelaPriority[] = ["CRITICA", "ALTA", "MEDIA", "BAJA"];

  const recentTutelas = useMemo(() => [...tutelas].sort((a, b) =>
    new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  ).slice(0, 10), [tutelas]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Reportes y Estadísticas</div>
      <div style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>Métricas en tiempo real basadas en los datos del sistema</div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Total Tutelas", value: stats.total, color: "#111214" },
          { label: "Activas", value: stats.activas, color: "#2563eb" },
          { label: "Cerradas/Resueltas", value: stats.cerradas, color: "#16a34a" },
          { label: "Críticas", value: stats.criticas, color: "#dc2626" },
          { label: "Vencidas", value: stats.vencidas, color: "#d97706" },
          { label: "Sin Asignar", value: stats.sinAsignar, color: "#64748b" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <div style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginTop: 4 }}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Por etapa */}
        <Card>
          <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Distribución por Etapa</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 10 }}>
            {stages.map((s) => (
              <BarRow key={s} label={STAGE_LABEL[s]} value={stageCount(s)} max={stats.total || 1} color="#111214" />
            ))}
          </div>
        </Card>

        {/* Por prioridad */}
        <Card>
          <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Distribución por Prioridad</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 10 }}>
            {priorities.map((p) => (
              <BarRow key={p} label={p} value={priorityCount(p)} max={stats.total || 1} color={PRIORITY_TONE[p]} />
            ))}
          </div>
        </Card>
      </div>

      {/* Tabla recientes */}
      <Card>
        <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Tutelas Recientes</div>
        <div style={{ padding: "0 14px 14px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #dfe5ee" }}>
                {["Radicado", "Paciente", "Servicio", "Prioridad", "Etapa", "Término"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 800, color: "#64748b", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTutelas.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 16, color: "#64748b", textAlign: "center" }}>Sin datos</td></tr>
              )}
              {recentTutelas.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 800 }}>{t.radicado}</td>
                  <td style={{ padding: "8px 10px" }}>{t.paciente}</td>
                  <td style={{ padding: "8px 10px", color: "#64748b" }}>{t.servicioSolicitado}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <Badge tone={t.prioridad === "CRITICA" ? "danger" : t.prioridad === "ALTA" ? "warning" : t.prioridad === "MEDIA" ? "info" : "success"}>
                      {t.prioridad}
                    </Badge>
                  </td>
                  <td style={{ padding: "8px 10px" }}><Badge tone="neutral">{STAGE_LABEL[t.stage]}</Badge></td>
                  <td style={{ padding: "8px 10px", color: t.terminoRespuesta && new Date(t.terminoRespuesta) < new Date() ? "#dc2626" : "#64748b" }}>
                    {t.terminoRespuesta ? new Date(t.terminoRespuesta).toLocaleDateString("es-CO") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
