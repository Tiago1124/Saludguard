import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTutelas } from "../../context/TutelasContext";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import styles from "./DashboardPage.module.scss";
import { routes } from "../../router/routes";
import { useNavigate } from "react-router-dom";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EPS: "Abogado EPS",
  LAWYER: "Abogado",
};

export default function DashboardPage() {
  const { state } = useAuth();
  const { tutelas, stageCount, priorityCount } = useTutelas();
  const nav = useNavigate();
  const user = state.user!;

  const metrics = useMemo(() => {
    const assigned =
      user.role === "LAWYER"
        ? tutelas.filter((t) => t.assignedToUserId === user.id).length
        : tutelas.length;
    const pendientes = stageCount("RECEPCION") + stageCount("ANALISIS");
    const enContestacion = stageCount("CONTESTACION");
    const cerradas = stageCount("CERRADA") + stageCount("FALLO");
    return { assigned, pendientes, enContestacion, cerradas };
  }, [tutelas, user]);

  const criticalAlerts = useMemo(() => {
    const now = Date.now();
    return tutelas
      .filter((t) => t.terminoRespuesta && t.stage !== "CERRADA" && t.stage !== "FALLO")
      .map((t) => ({ ...t, horasRestantes: Math.round((new Date(t.terminoRespuesta).getTime() - now) / 36e5) }))
      .filter((t) => t.horasRestantes <= 72)
      .sort((a, b) => a.horasRestantes - b.horasRestantes)
      .slice(0, 3);
  }, [tutelas]);

  return (
    <div className={styles.page}>
      <div className={styles.title}>
        Dashboard — {ROLE_LABELS[user.role] ?? user.role}
      </div>
      <div className={styles.sub}>Bienvenido {user.fullName}, aquí tienes un resumen de tu actividad</div>

      <div className={styles.stats}>
        <StatCard title="Tutelas Activas" value={metrics.assigned} iconTone="info" />
        <StatCard title="Pendientes de Respuesta" value={metrics.pendientes} iconTone="warning" />
        <StatCard title="En Contestación" value={metrics.enContestacion} iconTone="info" />
        <StatCard title="Resueltas" value={metrics.cerradas} iconTone="success" />
      </div>

      <Card className={styles.quick}>
        <div className={styles.blockTitle}>Acciones Rápidas</div>
        <div className={styles.blockSub}>Funciones principales para tu rol</div>

        <div className={styles.quickGrid}>
          <button className={styles.quickBtn} onClick={() => nav(routes.recepcion)}>
            <div className={styles.quickIcon} />
            <div className={styles.quickText}>Registrar Tutela</div>
          </button>
          <button className={styles.quickBtn} onClick={() => nav(routes.analisis)}>
            <div className={styles.quickIcon} />
            <div className={styles.quickText}>Analizar Casos</div>
          </button>
          <button className={styles.quickBtn} onClick={() => nav(routes.contestaciones)}>
            <div className={styles.quickIcon} />
            <div className={styles.quickText}>Redactar Contestación</div>
          </button>
        </div>
      </Card>

      <Card className={styles.alerts}>
        <div className={styles.blockTitle}>
          Alertas de Vencimiento
          {criticalAlerts.length > 0 && (
            <span style={{ marginLeft: 8 }}><Badge tone="danger">{criticalAlerts.length}</Badge></span>
          )}
        </div>

        {criticalAlerts.length === 0 ? (
          <div style={{ padding: "16px 20px", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
            No hay tutelas próximas a vencer. ✓
          </div>
        ) : (
          criticalAlerts.map((t) => (
            <div
              key={t.id}
              className={t.horasRestantes <= 0 ? styles.alertRowDanger : styles.alertRowWarn}
            >
              <div>
                <div className={styles.alertTitle}>{t.radicado} — {t.paciente}</div>
                <div className={styles.alertSub}>
                  {t.horasRestantes <= 0
                    ? `Vencida hace ${Math.abs(t.horasRestantes)} horas`
                    : `Vence en ${t.horasRestantes} horas`}
                  {" · "}{t.servicioSolicitado}
                </div>
              </div>
              <Badge tone={t.horasRestantes <= 0 ? "danger" : t.horasRestantes <= 24 ? "danger" : "warning"}>
                {t.horasRestantes <= 0 ? "Vencida" : priorityCount("CRITICA") > 0 && t.prioridad === "CRITICA" ? "Crítico" : "Urgente"}
              </Badge>
            </div>
          ))
        )}

        <div className={styles.alertActions}>
          <Button variant="outline" onClick={() => nav(routes.alertas)}>Ver Centro de Alertas</Button>
          <Button onClick={() => nav(routes.reportes)}>Ver Reportes</Button>
        </div>
      </Card>
    </div>
  );
}
