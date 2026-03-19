import { useMemo } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useTutelas } from "../../context/TutelasContext";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import type { TutelaCase, TutelaStage } from "../../types/tutela";

const STAGE_LABEL: Record<TutelaStage, string> = {
  RECEPCION: "Recepción",
  ANALISIS: "En Análisis",
  CONTESTACION: "Contestación",
  DOCUMENTAL: "Documental",
  FALLO: "Fallo",
  CERRADA: "Cerrada",
};

type UrgencyLevel = "vencida" | "critica" | "alta" | "ok" | "cerrada";

function getUrgency(t: TutelaCase): UrgencyLevel {
  if (t.stage === "CERRADA" || t.stage === "FALLO") return "cerrada";
  if (!t.terminoRespuesta) return "ok";
  const horasLeft = (new Date(t.terminoRespuesta).getTime() - Date.now()) / 36e5;
  if (horasLeft <= 0) return "vencida";
  if (horasLeft <= 24) return "critica";
  if (horasLeft <= 72) return "alta";
  return "ok";
}

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  vencida: "#dc2626",
  critica: "#ef4444",
  alta: "#d97706",
  ok: "#16a34a",
  cerrada: "#94a3b8",
};

const URGENCY_BG: Record<UrgencyLevel, string> = {
  vencida: "#fef2f2",
  critica: "#fff7ed",
  alta: "#fffbeb",
  ok: "#f0fdf4",
  cerrada: "#f8fafc",
};

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  vencida: "Vencida",
  critica: "Crítica (< 24h)",
  alta: "Urgente (< 72h)",
  ok: "Al día",
  cerrada: "Cerrada",
};

function horasLabel(t: TutelaCase): string {
  if (!t.terminoRespuesta) return "Sin plazo";
  const h = (new Date(t.terminoRespuesta).getTime() - Date.now()) / 36e5;
  if (h <= 0) return `Vencida hace ${Math.abs(Math.round(h))}h`;
  if (h < 24) return `${Math.round(h)}h restantes`;
  return `${Math.floor(h / 24)}d restantes`;
}

export default function CumplimientoPage() {
  const { tutelas } = useTutelas();
  const nav = useNavigate();

  const sorted = useMemo(() => {
    const urgencyOrder: UrgencyLevel[] = ["vencida", "critica", "alta", "ok", "cerrada"];
    return [...tutelas].sort((a, b) => {
      const ua = getUrgency(a);
      const ub = getUrgency(b);
      if (urgencyOrder.indexOf(ua) !== urgencyOrder.indexOf(ub)) {
        return urgencyOrder.indexOf(ua) - urgencyOrder.indexOf(ub);
      }
      if (a.terminoRespuesta && b.terminoRespuesta) {
        return new Date(a.terminoRespuesta).getTime() - new Date(b.terminoRespuesta).getTime();
      }
      return 0;
    });
  }, [tutelas]);

  const counts = useMemo(() => ({
    vencidas: sorted.filter((t) => getUrgency(t) === "vencida").length,
    criticas: sorted.filter((t) => getUrgency(t) === "critica").length,
    altas: sorted.filter((t) => getUrgency(t) === "alta").length,
    alDia: sorted.filter((t) => getUrgency(t) === "ok").length,
    cerradas: sorted.filter((t) => getUrgency(t) === "cerrada").length,
  }), [sorted]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Cumplimiento de Plazos</div>
      <div style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>Monitoreo en tiempo real de términos legales</div>

      {/* Semáforo resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "Vencidas", value: counts.vencidas, color: "#dc2626", bg: "#fef2f2" },
          { label: "Críticas (<24h)", value: counts.criticas, color: "#ef4444", bg: "#fff7ed" },
          { label: "Urgentes (<72h)", value: counts.altas, color: "#d97706", bg: "#fffbeb" },
          { label: "Al día", value: counts.alDia, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Cerradas", value: counts.cerradas, color: "#64748b", bg: "#f8fafc" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <div style={{ padding: 14, textAlign: "center", background: bg, borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 4 }}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabla de tutelas */}
      <Card>
        <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Todas las Tutelas — Seguimiento de Plazos</div>
        <div style={{ padding: "0 14px 14px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #dfe5ee" }}>
                {["Estado", "Radicado", "Paciente", "Etapa", "Término", "Plazo"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 800, color: "#64748b", whiteSpace: "nowrap" }}>{h}</th>
                ))}
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 800, color: "#64748b" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 20, color: "#64748b", textAlign: "center" }}>Sin tutelas registradas.</td></tr>
              )}
              {sorted.map((t) => {
                const urgency = getUrgency(t);
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9", background: URGENCY_BG[urgency] }}>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: URGENCY_COLOR[urgency], display: "inline-block" }} />
                    </td>
                    <td style={{ padding: "8px 10px", fontWeight: 800 }}>{t.radicado}</td>
                    <td style={{ padding: "8px 10px" }}>{t.paciente}</td>
                    <td style={{ padding: "8px 10px" }}><Badge tone="neutral">{STAGE_LABEL[t.stage]}</Badge></td>
                    <td style={{ padding: "8px 10px", color: "#64748b" }}>
                      {t.terminoRespuesta ? new Date(t.terminoRespuesta).toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: URGENCY_COLOR[urgency] }}>
                      {horasLabel(t)}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      {t.stage !== "CERRADA" && (
                        <Button size="sm" variant="outline" onClick={() => nav(routes.analisis)}>
                          Ver
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Leyenda */}
      <Card>
        <div style={{ padding: "12px 14px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Leyenda:</span>
          {Object.entries(URGENCY_LABEL).map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: URGENCY_COLOR[key as UrgencyLevel] }} />
              {label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
