import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import styles from "./LoginPage.module.scss";

const demoUsers = [
  { label: "Admin Sistema",  email: "admin@demo.com",   desc: "Administrador — admin@demo.com",   pass: "123456" },
  { label: "EPS Demo",       email: "eps@demo.com",     desc: "EPS — eps@demo.com",               pass: "123456" },
  { label: "Abogado Demo",   email: "abogado@demo.com", desc: "Abogado — abogado@demo.com",       pass: "123456" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(() => "Sistema de Gestión de Tutelas en Salud", []);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Error al iniciar sesión.");
      return;
    }
    nav("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>SaludGuard</div>
          <div className={styles.brandSub}>{subtitle}</div>
        </div>

        <Card className={styles.loginCard}>
          <div className={styles.cardTitle}>Iniciar Sesión</div>
          <div className={styles.cardSub}>Ingrese sus credenciales para acceder al sistema</div>

          <label className={styles.field}>
            <div className={styles.label}>Correo Electrónico</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>Contraseña</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
          </label>

          {error ? <div className={styles.error}>{error}</div> : null}

          <Button onClick={onSubmit} className={styles.fullBtn} disabled={loading}>
            {loading ? "Ingresando…" : "Iniciar Sesión"}
          </Button>
        </Card>

        <Card className={styles.demoCard}>
          <div className={styles.cardTitle}>Usuarios de Demostración</div>
          <div className={styles.cardSub}>Haga clic para usar credenciales de prueba</div>

          <div className={styles.demoList}>
            {demoUsers.map((u) => (
              <button
                key={u.email}
                className={styles.demoItem}
                onClick={() => {
                  setEmail(u.email);
                  setPassword(u.pass);
                  setError(null);
                }}
              >
                <div className={styles.demoLabel}>{u.label}</div>
                <div className={styles.demoDesc}>{u.desc}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
