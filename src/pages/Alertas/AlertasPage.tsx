import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import styles from "./AlertasPage.module.scss";
import { useTutelas } from "../../context/TutelasContext";
import { routes } from "../../router/routes";
import type { TutelaCase, TutelaPriority } from "../../types/tutela";

type AlertItem = {
  id: string;
  tutela: TutelaCase;
  title: string;
  subtitle: string;
  priority: TutelaPriority;
  horasRestantes: number;
  dismissed: boolean;
};

function prioLabel(p: TutelaPriority) {
  return { CRITICA: "Crítica", ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" }[p];
}

function prioTone(p: TutelaPriority): "danger" | "warning" | "info" | "success" {
  return { CRITICA: "danger", ALTA: "warning", MEDIA: "info", BAJA: "success" }[p] as any;
}

export default function AlertasPage() {
  const { tutelas } = useTutelas();
  const nav = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo((): AlertItem[] => {
    const now = Date.now();
    return tutelas
      .filter((t) => t.stage !== "CERRADA" && t.terminoRespuesta)
      .map((t) => {
        const msLeft = new Date(t.terminoRespuesta).getTime() - now;
        const horas = Math.round(msLeft / 36e5);
        return { id: t.id, tutela: t, horasRestantes: horas, dismissed: false, priority: t.prioridad,
          title: horas <= 0
            ? `Tutela ${t.radicado} vencida`
            : horas <= 24
            ? `Tutela ${t.radicado} vence en ${horas}h`
            : `Tutela ${t.radicado} vence en ${Math.floor(horas / 24)} días`,
          subtitle: `${t.paciente} · ${t.servicioSolicitado} · Juzgado: ${t.juzgado || "—"}`,
        };
      })
      .filter((a) => a.horasRestantes <= 72) // mostrar las de 3 días o menos
      .sort((a, b) => a.horasRestantes - b.horasRestantes);
  }, [tutelas]);

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  const criticas = visible.filter((a) => a.horasRestantes <= 0 || a.priority === "CRITICA").length;

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.title}>Centro de Alertas y Notificaciones</div>
            <div className={styles.subtitle}>Tutelas próximas a vencer o con prioridad crítica</div>
          </div>
          <div className={styles.actionsTop}>
            <Button variant="outline" onClick={() => setDismissed(new Set(alerts.map((a) => a.id)))}>
              Marcar Todo Leído
            </Button>
          </div>
        </div>

        <Card>
          <div className={styles.sectionTitle}>
            <span>Alertas Activas</span>
            <Badge tone={criticas > 0 ? "danger" : "neutral"}>{visible.length}</Badge>
          </div>

          <div className={styles.list}>
            {visible.length === 0 && (
              <div style={{ padding: 20, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                ✓ Sin alertas activas. Todas las tutelas tienen plazo suficiente.
              </div>
            )}
            {visible.map((a) => (
              <div
                key={a.id}
                className={`${styles.alertCard} ${styles[a.horasRestantes <= 0 || a.priority === "CRITICA" ? "critical" : a.priority === "ALTA" ? "high" : "medium"]}`}
              >
                <div className={styles.alertTop}>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>
                      {a.title}{" "}
                      <Badge tone={prioTone(a.priority)}>{prioLabel(a.priority)}</Badge>
                    </div>
                    <div className={styles.alertSub}>{a.subtitle}</div>
                  </div>
                  <button className={styles.close} onClick={() => setDismissed((s) => new Set([...s, a.id]))} aria-label="Cerrar">×</button>
                </div>

                <div className={styles.metaGrid}>
                  <div>
                    <div className={styles.metaLabel}>Paciente:</div>
                    <div className={styles.metaValue}>{a.tutela.paciente}</div>
                    <div className={styles.metaLabel}>Radicado:</div>
                    <div className={styles.metaValue}>{a.tutela.radicado}</div>
                  </div>
                  <div>
                    <div className={styles.metaLabel}>Etapa:</div>
                    <div className={styles.metaValue}>{a.tutela.stage}</div>
                    <div className={styles.metaLabel}>Término:</div>
                    <div className={styles.metaValue} style={{ color: a.horasRestantes <= 0 ? "#dc2626" : "inherit" }}>
                      {a.horasRestantes <= 0 ? `Vencida hace ${Math.abs(a.horasRestantes)}h` : `${a.horasRestantes}h restantes`}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <Button variant="primary" onClick={() => nav(routes.analisis)}>Ver Caso</Button>
                    <Button variant="ghost" onClick={() => nav(routes.contestaciones)}>Contestar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.side}>
        <Card>
          <div className={styles.sideTitle}>Resumen de Alertas</div>
          <div className={styles.sideStats}>
            <div><span>Activas</span><b>{visible.length}</b></div>
            <div><span>Críticas</span><b>{visible.filter(a => a.priority === "CRITICA").length}</b></div>
            <div><span>Vencidas</span><b>{visible.filter(a => a.horasRestantes <= 0).length}</b></div>
            <div><span>En 24h</span><b>{visible.filter(a => a.horasRestantes > 0 && a.horasRestantes <= 24).length}</b></div>
            <div><span>En 72h</span><b>{visible.filter(a => a.horasRestantes > 0 && a.horasRestantes <= 72).length}</b></div>
          </div>
        </Card>

        <Card>
          <div className={styles.sideTitle}>Acciones Rápidas</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 8 }}>
            <Button variant="outline" onClick={() => nav(routes.analisis)}>Ir a Análisis</Button>
            <Button variant="outline" onClick={() => nav(routes.contestaciones)}>Ir a Contestaciones</Button>
            <Button variant="outline" onClick={() => nav(routes.cumplimiento)}>Ver Cumplimiento</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
