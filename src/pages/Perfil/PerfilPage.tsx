import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "./PerfilPage.module.scss";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EPS: "Abogado EPS",
  LAWYER: "Abogado",
};

export default function PerfilPage() {
  const { state } = useAuth();
  const user = state.user!;

  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [saved, setSaved] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState<string | null>(null);

  const permissions = useMemo(() => {
    const base = [
      "tutelas: recibir y registrar",
      "tutelas: analizar",
      "tutelas: contestar",
      "documentos: gestionar",
      "reportes: ver",
      "recursos: consultar",
    ];
    if (user.role === "ADMIN" || user.role === "EPS") {
      base.push("usuarios: gestionar", "tutelas: asignar a otros");
    }
    return base;
  }, [user.role]);

  function onUpdateProfile() {
    // Actualiza el nombre visible en localStorage (sesión activa)
    const raw = localStorage.getItem("SG_USER");
    if (raw) {
      const u = JSON.parse(raw);
      localStorage.setItem("SG_USER", JSON.stringify({ ...u, fullName, email }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function onChangePassword() {
    setPassMsg(null);
    if (!currentPass || !newPass || newPass !== confirmPass) {
      setPassMsg("Verifica que los campos sean correctos y que las contraseñas coincidan.");
      return;
    }
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    setPassMsg("✓ Contraseña actualizada (demo — no persiste en este MVP).");
    setTimeout(() => setPassMsg(null), 4000);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal y configuración de cuenta</p>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <div className={styles.cardTitle}>
            <h3>Información Personal</h3>
            <p>Información de tu cuenta activa</p>
          </div>
          <div className={styles.form}>
            <Input label="Nombre Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Rol" value={ROLE_LABELS[user.role] ?? user.role} readOnly />
            <Input label="ID de Usuario" value={user.id} readOnly />
            {saved && <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>✓ Perfil actualizado</div>}
            <div className={styles.actions}>
              <Button variant="primary" onClick={onUpdateProfile}>Actualizar Perfil</Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>
            <h3>Cambiar Contraseña</h3>
            <p>Actualiza tu contraseña de acceso</p>
          </div>
          <div className={styles.form}>
            <Input label="Contraseña Actual" type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
            <Input label="Nueva Contraseña" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <Input label="Confirmar Nueva Contraseña" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            {passMsg && <div style={{ fontSize: 13, fontWeight: 700, color: passMsg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>{passMsg}</div>}
            <div className={styles.actions}>
              <Button variant="primary" onClick={onChangePassword}>Cambiar Contraseña</Button>
            </div>
          </div>
        </Card>

        <Card className={styles.perms}>
          <div className={styles.cardTitle}>
            <h3>Permisos del Usuario</h3>
            <p>Permisos asignados según tu rol: <strong>{ROLE_LABELS[user.role] ?? user.role}</strong></p>
          </div>
          <ul className={styles.permList}>
            {permissions.map((p) => (
              <li key={p}><span className={styles.check}>✓</span> {p}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
