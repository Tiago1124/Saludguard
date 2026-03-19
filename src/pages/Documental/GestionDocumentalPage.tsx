import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import { useTutelas } from "../../context/TutelasContext";
import { documentApi } from "../../utils/api";

type DocTipo = "HISTORIA_CLINICA" | "AUTORIZACION" | "ACTA_COMITE" | "PQR" | "CONTESTACION" | "FALLO";
type DocStatus = "ACTIVO" | "APROBADO" | "EN_REVISION";

const TIPO_LABELS: Record<DocTipo, string> = {
  HISTORIA_CLINICA: "Historia Clínica",
  AUTORIZACION: "Autorización",
  ACTA_COMITE: "Acta de Comité",
  PQR: "PQR",
  CONTESTACION: "Contestación",
  FALLO: "Fallo",
};

const STATUS_TONE: Record<DocStatus, "success" | "warning" | "info"> = {
  ACTIVO: "info",
  APROBADO: "success",
  EN_REVISION: "warning",
};

type LocalDoc = { id: string; tutelaId: string; fileName: string; tipo: DocTipo; status: DocStatus; registradoAt: string };

export default function GestionDocumentalPage() {
  const { tutelas } = useTutelas();
  const [filterTutela, setFilterTutela] = useState("");
  const [docs, setDocs] = useState<LocalDoc[]>([]);

  // Form
  const [formTutela, setFormTutela] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formTipo, setFormTipo] = useState<DocTipo>("HISTORIA_CLINICA");
  const [formStatus, setFormStatus] = useState<DocStatus>("ACTIVO");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeTutelas = useMemo(() => tutelas.filter((t) => t.stage !== "CERRADA"), [tutelas]);

  const visible = useMemo(() => {
    if (!filterTutela) return docs;
    return docs.filter((d) => d.tutelaId === filterTutela);
  }, [docs, filterTutela]);

  const tutelaLabel = (id: string) => {
    const t = tutelas.find((t) => t.id === id);
    return t ? `${t.radicado} — ${t.paciente}` : id;
  };

  const onRegistrar = async () => {
    if (!formTutela || !formFileName.trim()) return;
    setSaving(true);
    try {
      await documentApi.create({
        tutelaId: Number(formTutela),
        fileName: formFileName,
        tipo: formTipo,
        status: formStatus,
        modifiedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
      });
      setDocs((prev) => [{
        id: `d_${Date.now()}`,
        tutelaId: formTutela,
        fileName: formFileName,
        tipo: formTipo,
        status: formStatus,
        registradoAt: new Date().toLocaleDateString("es-CO"),
      }, ...prev]);
      setFormFileName("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently ignore if backend down
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Gestión Documental</div>
      <div style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>Repositorio centralizado de documentos por tutela</div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, alignItems: "start" }}>
        {/* Formulario */}
        <Card>
          <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Registrar Documento</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 12 }}>
            <Select label="Tutela *" value={formTutela} onChange={(e) => setFormTutela(e.target.value)}>
              <option value="">Seleccionar tutela…</option>
              {activeTutelas.map((t) => (
                <option key={t.id} value={t.id}>{t.radicado} — {t.paciente}</option>
              ))}
            </Select>
            <Input label="Nombre del archivo *" value={formFileName} onChange={(e) => setFormFileName(e.target.value)} placeholder="Ej: Historia_Clinica_Paciente.pdf" />
            <Select label="Tipo de documento" value={formTipo} onChange={(e) => setFormTipo(e.target.value as DocTipo)}>
              {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select label="Estado" value={formStatus} onChange={(e) => setFormStatus(e.target.value as DocStatus)}>
              <option value="ACTIVO">Activo</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="APROBADO">Aprobado</option>
            </Select>
            {saved && <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>✓ Documento registrado</div>}
            <Button onClick={onRegistrar} disabled={saving || !formTutela || !formFileName.trim()}>
              {saving ? "Registrando…" : "Registrar Documento"}
            </Button>
          </div>
        </Card>

        {/* Lista de documentos */}
        <div style={{ display: "grid", gap: 12 }}>
          <Card>
            <div style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900, flex: 1 }}>Documentos ({visible.length})</div>
              <div style={{ minWidth: 260 }}>
                <Select value={filterTutela} onChange={(e) => setFilterTutela(e.target.value)}>
                  <option value="">Todas las tutelas</option>
                  {activeTutelas.map((t) => (
                    <option key={t.id} value={t.id}>{t.radicado}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {/* Grupos por tutela */}
          {activeTutelas
            .filter((t) => !filterTutela || t.id === filterTutela)
            .map((t) => {
              const tDocs = docs.filter((d) => d.tutelaId === t.id);
              return (
                <Card key={t.id}>
                  <div style={{ padding: "12px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>{t.radicado}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{t.paciente} · {t.stage}</div>
                    </div>
                    <Badge tone="neutral">{tDocs.length} doc(s)</Badge>
                  </div>
                  {tDocs.length === 0 ? (
                    <div style={{ padding: "0 14px 12px", color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                      Sin documentos registrados.
                    </div>
                  ) : (
                    <div style={{ padding: "0 14px 12px", display: "grid", gap: 6 }}>
                      {tDocs.map((d) => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f7fafc", borderRadius: 8, fontSize: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{d.fileName}</div>
                            <div style={{ color: "#64748b", fontWeight: 600 }}>{TIPO_LABELS[d.tipo]} · {d.registradoAt}</div>
                          </div>
                          <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}

          {activeTutelas.filter((t) => !filterTutela || t.id === filterTutela).length === 0 && (
            <Card>
              <div style={{ padding: 20, color: "#64748b", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                No hay tutelas activas.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
