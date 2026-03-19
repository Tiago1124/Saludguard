import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import { useTutelas } from "../../context/TutelasContext";
import type { TutelaCase } from "../../types/tutela";

const PLANTILLAS = [
  {
    label: "Negación del servicio — Exclusión POS",
    text: `Respetado señor Juez,\n\nEn respuesta a la tutela interpuesta, manifestamos que el servicio solicitado no se encuentra incluido en el Plan de Beneficios en Salud (PBS), conforme a lo establecido en la Resolución vigente del Ministerio de Salud. Por lo anterior, la negación del servicio se fundamenta en criterios técnico-médicos y en las exclusiones contempladas en la normatividad aplicable.\n\nRespetuosamente,`,
  },
  {
    label: "Trámite en curso — Autorización pendiente",
    text: `Respetado señor Juez,\n\nDe manera atenta informamos que la solicitud del servicio médico referido en la tutela se encuentra en proceso de estudio y autorización por parte del Comité Técnico Científico de nuestra entidad. El proceso se adelanta conforme a los términos establecidos en la normatividad vigente y se espera resolución en el menor tiempo posible.\n\nRespetuosamente,`,
  },
  {
    label: "Remisión a red de prestadores",
    text: `Respetado señor Juez,\n\nEn atención a la tutela, informamos que el servicio solicitado ha sido tramitado y se ha generado la respectiva remisión a la red de prestadores habilitados de nuestra entidad. El usuario podrá acceder al servicio a través de los prestadores asignados en su zona de residencia.\n\nRespetuosamente,`,
  },
];

function TutelaSelector({ tutelas, selected, onSelect }: {
  tutelas: TutelaCase[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8, maxHeight: 360, overflowY: "auto" }}>
      {tutelas.length === 0 && (
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, padding: 8 }}>
          No hay casos en etapa de análisis o contestación.
        </div>
      )}
      {tutelas.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            border: `2px solid ${selected === t.id ? "#111214" : "#dfe5ee"}`,
            borderRadius: 10,
            padding: "10px 12px",
            background: selected === t.id ? "#f0f4ff" : "#f7fafc",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13 }}>{t.radicado}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{t.paciente} · {t.servicioSolicitado}</div>
          <div style={{ marginTop: 4 }}>
            <Badge tone={t.prioridad === "CRITICA" ? "danger" : t.prioridad === "ALTA" ? "warning" : "info"}>
              {t.prioridad}
            </Badge>{" "}
            <Badge tone="neutral">{t.stage}</Badge>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function ContestacionesPage() {
  const { tutelas, updateTutela } = useTutelas();
  const [selectedId, setSelectedId] = useState("");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const candidatas = useMemo(
    () => tutelas.filter((t) => t.stage === "ANALISIS" || t.stage === "CONTESTACION" || t.stage === "RECEPCION"),
    [tutelas]
  );

  const selected = candidatas.find((t) => t.id === selectedId) ?? null;

  const onGuardar = async () => {
    if (!selected || !texto.trim()) return;
    setSaving(true);
    await updateTutela(selected.id, { stage: "CONTESTACION" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const onFinalizar = async () => {
    if (!selected) return;
    setSaving(true);
    await updateTutela(selected.id, { stage: "DOCUMENTAL" });
    setSaving(false);
    setSaved(true);
    setTexto("");
    setSelectedId("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
      {/* Panel izquierdo: lista de tutelas */}
      <Card>
        <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>Casos Pendientes</div>
        <div style={{ padding: "0 14px 14px" }}>
          <TutelaSelector tutelas={candidatas} selected={selectedId} onSelect={setSelectedId} />
        </div>
      </Card>

      {/* Panel derecho: editor */}
      <div style={{ display: "grid", gap: 16 }}>
        {!selected ? (
          <Card>
            <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
              Selecciona un caso de la lista izquierda para redactar su contestación.
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>
                Contestación — {selected.radicado}
              </div>
              <div style={{ padding: "0 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div><span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Paciente: </span><b style={{ fontSize: 12 }}>{selected.paciente}</b></div>
                <div><span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Servicio: </span><b style={{ fontSize: 12 }}>{selected.servicioSolicitado}</b></div>
                <div><span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Juzgado: </span><b style={{ fontSize: 12 }}>{selected.juzgado || "—"}</b></div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Plantillas</div>
              <div style={{ padding: "0 14px 14px" }}>
                <Select onChange={(e) => { if (e.target.value) setTexto(e.target.value); }}>
                  <option value="">Seleccionar plantilla…</option>
                  {PLANTILLAS.map((p) => (
                    <option key={p.label} value={p.text}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </Card>

            <Card>
              <div style={{ padding: "14px 14px 10px", fontWeight: 900 }}>Texto de la Contestación</div>
              <div style={{ padding: "0 14px 14px" }}>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Redacte aquí la contestación a la tutela..."
                  style={{
                    width: "100%", minHeight: 260, border: "1px solid #dfe5ee", borderRadius: 8,
                    padding: 12, fontSize: 13, fontFamily: "inherit", resize: "vertical",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <Button onClick={onGuardar} disabled={saving || !texto.trim()}>
                    {saving ? "Guardando…" : "Guardar Borrador"}
                  </Button>
                  <Button variant="outline" onClick={onFinalizar} disabled={saving || !texto.trim()}>
                    Marcar como Presentada
                  </Button>
                  {saved && <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>✓ Guardado</span>}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
