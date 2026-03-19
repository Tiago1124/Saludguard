import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import styles from "./GestionUsuariosPage.module.scss";
import { useUsers } from "../../context/UsersContext";
import type { Role } from "../../types/auth";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  EPS: "EPS",
  LAWYER: "Abogado",
};

export default function GestionUsuariosPage() {
  const { users, addUser, setStatus } = useUsers();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("LAWYER");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const visible = useMemo(() => users.filter((u) => u.status !== "DELETED"), [users]);

  const onCreate = async () => {
    setErr(null);
    setSuccess(false);
    if (!fullName.trim() || !email.trim()) {
      setErr("Nombre y correo son obligatorios.");
      return;
    }
    setLoading(true);
    const res = await addUser({ fullName, email, role, password: password || "demo123" });
    setLoading(false);
    if (!res.ok) {
      setErr(res.error ?? "No fue posible crear el usuario.");
      return;
    }
    setSuccess(true);
    setFullName("");
    setEmail("");
    setPassword("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.title}>Gestión de Usuarios</div>
      <div className={styles.sub}>Crear, congelar o eliminar usuarios del sistema</div>

      <div className={styles.grid}>
        <Card className={styles.formCard}>
          <div className={styles.blockTitle}>Nuevo Usuario</div>
          <div className={styles.blockSub}>Complete los campos para crear un usuario</div>

          <div className={styles.form}>
            <Input label="Nombre completo *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Correo *" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select label="Rol" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="LAWYER">Abogado</option>
              <option value="EPS">EPS</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Si queda vacío se usa 'demo123'" />

            {err && <div className={styles.err}>{err}</div>}
            {success && <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>✓ Usuario creado exitosamente</div>}

            <Button onClick={onCreate} disabled={loading}>
              {loading ? "Creando…" : "Crear Usuario"}
            </Button>
          </div>
        </Card>

        <Card className={styles.listCard}>
          <div className={styles.blockTitle}>Usuarios ({visible.length})</div>
          <div className={styles.table}>
            <div className={styles.thead}>
              <div>Nombre</div>
              <div>Correo</div>
              <div>Rol</div>
              <div>Estado</div>
              <div style={{ textAlign: "right" }}>Acciones</div>
            </div>

            {visible.map((u) => (
              <div key={u.id} className={styles.tr}>
                <div className={styles.nameCell}>
                  <div className={styles.avatar}>{u.avatarInitials}</div>
                  <div className={styles.nameText}>{u.fullName}</div>
                </div>
                <div className={styles.muted}>{u.email}</div>
                <div><Badge tone="info">{ROLE_LABELS[u.role] ?? u.role}</Badge></div>
                <div>
                  <Badge tone={u.status === "ACTIVE" ? "success" : "warning"}>
                    {u.status === "ACTIVE" ? "Activo" : "Congelado"}
                  </Badge>
                </div>
                <div className={styles.actions}>
                  {u.status === "ACTIVE" ? (
                    <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "FROZEN")}>
                      Congelar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "ACTIVE")}>
                      Activar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "DELETED")}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
