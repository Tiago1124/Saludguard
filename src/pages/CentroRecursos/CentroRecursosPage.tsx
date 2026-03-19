import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const PLANTILLAS = [
  { titulo: "Contestación por exclusión POS", desc: "Respuesta estándar para servicios no incluidos en el Plan de Beneficios.", tipo: "DOCX", categoria: "Contestación" },
  { titulo: "Contestación por trámite en curso", desc: "Formato para casos donde la autorización está en proceso.", tipo: "DOCX", categoria: "Contestación" },
  { titulo: "Solicitud de prórroga de término", desc: "Plantilla para solicitar al juzgado extensión del plazo de respuesta.", tipo: "DOCX", categoria: "Proceso" },
  { titulo: "Acta de Comité Técnico Científico", desc: "Formato oficial del CTC para decisiones sobre servicios médicos.", tipo: "DOCX", categoria: "Comité" },
  { titulo: "Comunicación al paciente", desc: "Carta de notificación al accionante sobre la decisión adoptada.", tipo: "DOCX", categoria: "Comunicación" },
  { titulo: "Informe de cumplimiento de fallo", desc: "Reporte para el juzgado sobre cumplimiento de la orden judicial.", tipo: "PDF", categoria: "Fallo" },
];

const NORMATIVIDAD = [
  { titulo: "Ley 1751 de 2015 — Derecho fundamental a la salud", desc: "Ley Estatutaria de Salud. Define el derecho fundamental y sus garantías." },
  { titulo: "Decreto 780 de 2016 — Sector Salud", desc: "Decreto único reglamentario del sector salud y protección social." },
  { titulo: "Resolución 2292 de 2021 — PBS", desc: "Plan de Beneficios en Salud vigente con servicios cubiertos y excluidos." },
  { titulo: "Circular 012 de 2019 — Atención tutelas", desc: "Instrucciones de la Superintendencia Nacional de Salud para respuesta a tutelas." },
];

const FAQS = [
  { q: "¿Cuánto tiempo tiene la EPS para responder una tutela?", a: "El término general es de 10 días calendario desde la notificación del auto admisorio. En casos de urgencia puede reducirse a 48 horas." },
  { q: "¿Qué es el CTC y cuándo debe intervenir?", a: "El Comité Técnico Científico analiza solicitudes de servicios no incluidos en el PBS. Debe reunirse en máximo 5 días hábiles." },
  { q: "¿Cómo se maneja el incidente de desacato?", a: "Si la EPS no cumple el fallo en el término ordenado, el juez puede iniciar incidente de desacato con sanciones disciplinarias y económicas." },
  { q: "¿Se pueden impugnar los fallos de tutela?", a: "Sí. La impugnación debe presentarse ante el juez de primera instancia dentro de los 3 días siguientes a la notificación del fallo." },
];

export default function CentroRecursosPage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Centro de Recursos</div>
      <div style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>Documentación, plantillas, normatividad y guías de apoyo</div>

      {/* Plantillas */}
      <Card>
        <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>Plantillas de Documentos</div>
        <div style={{ padding: "0 14px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {PLANTILLAS.map((p) => (
            <div
              key={p.titulo}
              style={{ border: "1px solid #dfe5ee", borderRadius: 10, padding: 14, display: "grid", gap: 8, background: "#f7fafc" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{p.titulo}</div>
                <Badge tone="neutral">{p.tipo}</Badge>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{p.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge tone="info">{p.categoria}</Badge>
                <Button size="sm" variant="outline">Descargar</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Normatividad */}
        <Card>
          <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>Marco Normativo</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 10 }}>
            {NORMATIVIDAD.map((n) => (
              <div key={n.titulo} style={{ borderLeft: "3px solid #111214", paddingLeft: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 12 }}>{n.titulo}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{n.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Guía de etapas */}
        <Card>
          <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>Flujo de una Tutela</div>
          <div style={{ padding: "0 14px 14px", display: "grid", gap: 8 }}>
            {[
              { etapa: "1. Recepción", desc: "Notificación del juzgado y registro en el sistema." },
              { etapa: "2. Análisis", desc: "Revisión jurídica y técnico-médica del caso." },
              { etapa: "3. Contestación", desc: "Redacción y presentación de la respuesta al juzgado." },
              { etapa: "4. Documental", desc: "Recopilación y organización de soportes documentales." },
              { etapa: "5. Fallo", desc: "Recepción y análisis del fallo judicial." },
              { etapa: "6. Cerrada", desc: "Cumplimiento del fallo o archivo del expediente." },
            ].map(({ etapa, desc }) => (
              <div key={etapa} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ minWidth: 130, fontWeight: 800, fontSize: 12, color: "#111214" }}>{etapa}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <div style={{ padding: "14px 14px 10px", fontWeight: 900, fontSize: 15 }}>Preguntas Frecuentes</div>
        <div style={{ padding: "0 14px 14px", display: "grid", gap: 12 }}>
          {FAQS.map((f) => (
            <div key={f.q} style={{ border: "1px solid #dfe5ee", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", background: "#f1f5f9", fontWeight: 800, fontSize: 13 }}>{f.q}</div>
              <div style={{ padding: "10px 14px", fontSize: 12, color: "#374151", fontWeight: 600 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
