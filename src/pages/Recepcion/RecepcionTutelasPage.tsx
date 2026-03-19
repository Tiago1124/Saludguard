import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import TextArea from "../../components/ui/TextArea";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import styles from "./RecepcionTutelasPage.module.scss";
import { useTutelas } from "../../context/TutelasContext";

export default function RecepcionTutelasPage() {
  const { createTutela, tutelas } = useTutelas();

  const [radicado, setRadicado] = useState("");
  const [paciente, setPaciente] = useState("");
  const [juzgado, setJuzgado] = useState("");
  const [fechaNot, setFechaNot] = useState("");
  const [termino, setTermino] = useState("");
  const [servicio, setServicio] = useState("");
  const [derecho, setDerecho] = useState("");
  const [prioridad, setPrioridad] = useState<"MEDIA" | "ALTA" | "BAJA" | "CRITICA">("MEDIA");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const recent = useMemo(() => tutelas.slice(0, 5), [tutelas]);

  const onRegister = async () => {
    if (!radicado.trim() || !paciente.trim() || !fechaNot || !termino) return;
    setSaving(true);
    await createTutela({
      radicado,
      paciente,
      juzgado: juzgado || "Sin especificar",
      fechaNotificacion: new Date(fechaNot).toISOString(),
      terminoRespuesta: new Date(termino).toISOString(),
      servicioSolicitado: servicio || "—",
      derechoVulnerado: derecho || "—",
      prioridad,
      observaciones: obs,
      assignedToUserId: undefined,
    });
    setSaving(false);
    setSaved(true);
    setRadicado("");
    setPaciente("");
    setJuzgado("");
    setFechaNot("");
    setTermino("");
    setServicio("");
    setDerecho("");
    setObs("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.title}>Recepción de Tutelas</div>
          <div className={styles.sub}>Registro y digitalización de nuevas tutelas</div>
        </div>
      </div>

      <div className={styles.grid}>
        <Card className={styles.formCard}>
          <div className={styles.blockTitle}>Registro de Nueva Tutela</div>
          <div className={styles.blockSub}>Complete todos los campos obligatorios (*)</div>

          <div className={styles.sectionTitle}>Información Básica</div>
          <div className={styles.formGrid}>
            <Input label="Número de Radicado *" value={radicado} onChange={(e) => setRadicado(e.target.value)} placeholder="Ej: T-2024-001234" />
            <Select label="Juzgado *" value={juzgado} onChange={(e) => setJuzgado(e.target.value)}>
              <option value="">Seleccionar juzgado</option>
              <option>Juzgado 15 Civil Municipal</option>
              <option>Juzgado 8 Civil del Circuito</option>
              <option>Juzgado 22 Civil Municipal</option>
              <option>Juzgado 3 Administrativo</option>
            </Select>
            <Input label="Accionante (Paciente) *" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre completo del paciente" />
            <div className={styles.twoCols}>
              <Input label="Fecha de Notificación *" type="date" value={fechaNot} onChange={(e) => setFechaNot(e.target.value)} />
              <Input label="Término de Respuesta *" type="date" value={termino} onChange={(e) => setTermino(e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionTitle}>Detalles de la Tutela</div>
          <div className={styles.formGrid}>
            <Input label="Servicio Solicitado *" value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="Ej: Cirugía de rodilla, Resonancia magnética, etc." />
            <Select label="Derecho Vulnerado" value={derecho} onChange={(e) => setDerecho(e.target.value)}>
              <option value="">Seleccionar derecho vulnerado</option>
              <option>Salud</option>
              <option>Vida digna</option>
              <option>Seguridad social</option>
              <option>Debido proceso</option>
            </Select>
            <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as any)}>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </Select>
            <TextArea label="Observaciones" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones adicionales sobre la tutela..." />
          </div>

          {saved && (
            <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              ✓ Tutela registrada exitosamente
            </div>
          )}

          <div className={styles.footerActions}>
            <Button onClick={onRegister} disabled={saving || !radicado || !paciente || !fechaNot || !termino}>
              {saving ? "Registrando…" : "Registrar Tutela"}
            </Button>
          </div>
        </Card>

        <div className={styles.rightCol}>
          <Card className={styles.recentCard}>
            <div className={styles.recentTop}>
              <div className={styles.blockTitle}>Tutelas Recientes</div>
              <Badge tone="neutral">{recent.length}</Badge>
            </div>
            <div className={styles.recentList}>
              {recent.length === 0 && (
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, padding: 8 }}>
                  Sin tutelas registradas aún.
                </div>
              )}
              {recent.map((t) => (
                <div key={t.id} className={styles.recentItem}>
                  <div className={styles.recentMeta}>
                    <div className={styles.recentRad}>{t.radicado}</div>
                    <div className={styles.recentName}>{t.paciente || "—"}</div>
                    <div className={styles.recentSvc}>{t.servicioSolicitado}</div>
                  </div>
                  <Badge tone={t.prioridad === "CRITICA" ? "danger" : t.prioridad === "ALTA" ? "warning" : "neutral"}>
                    {t.prioridad === "CRITICA" ? "Crítica" : t.prioridad === "ALTA" ? "Alta" : "Media"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
