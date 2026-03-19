import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { routes } from "../../router/routes";
import styles from "./Sidebar.module.scss";

type NavItem = { to: string; label: string; icon: "grid" | "inbox" | "scale" | "doc" | "bell" | "chart" | "users" | "shield" | "book" | "profile" };

function itemsByRole(role: "ADMIN" | "EPS" | "LAWYER"): NavItem[] {
  if (role === "ADMIN") {
    return [
      { to: routes.dashboard, label: "Dashboard", icon: "grid" },
      { to: routes.recepcion, label: "Recepción Tutelas", icon: "inbox" },
      { to: routes.analisis, label: "Análisis y Revisión", icon: "scale" },
      { to: routes.contestaciones, label: "Contestaciones", icon: "scale" },
      { to: routes.documental, label: "Gestión Documental", icon: "doc" },
      { to: routes.cumplimiento, label: "Cumplimiento", icon: "shield" },
      { to: routes.alertas, label: "Alertas", icon: "bell" },
      { to: routes.reportes, label: "Reportes", icon: "chart" },
      { to: routes.usuarios, label: "Gestión Usuarios", icon: "users" },
    ];
  }

  if (role === "EPS") {
    return [
      { to: routes.dashboard, label: "Dashboard", icon: "grid" },
      { to: routes.recepcion, label: "Recepción Tutelas", icon: "inbox" },
      { to: routes.analisis, label: "Análisis y Revisión", icon: "scale" },
      { to: routes.contestaciones, label: "Contestaciones", icon: "scale" },
      { to: routes.documental, label: "Gestión Documental", icon: "doc" },
      { to: routes.alertas, label: "Alertas", icon: "bell" },
      { to: routes.reportes, label: "Reportes", icon: "chart" },
      { to: routes.recursos, label: "Centro de Recursos", icon: "book" },
      { to: routes.usuarios, label: "Mi Equipo", icon: "users" },
    ];
  }

  // LAWYER
  return [
    { to: routes.dashboard, label: "Dashboard", icon: "grid" },
    { to: routes.recepcion, label: "Recepción Tutelas", icon: "inbox" },
    { to: routes.analisis, label: "Análisis y Revisión", icon: "scale" },
    { to: routes.contestaciones, label: "Contestaciones", icon: "scale" },
    { to: routes.alertas, label: "Alertas", icon: "bell" },
    { to: routes.reportes, label: "Reportes", icon: "chart" },
  ];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EPS: "Abogado EPS",
  LAWYER: "Abogado",
};

function Icon({ name }: { name: NavItem["icon"] }) {
  switch (name) {
    case "grid":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "inbox":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v10l-3 3H7l-3-3V4Z" stroke="currentColor" strokeWidth="1.6" /><path d="M4 14h5l2 2h2l2-2h5" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "scale":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" /><path d="M6 7h12" stroke="currentColor" strokeWidth="1.6" /><path d="M7 7 4 12h6L7 7Zm10 0-3 5h6l-3-5Z" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "doc":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "bell":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.6" /><path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "chart":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19V5" stroke="currentColor" strokeWidth="1.6" /><path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" /><path d="M7 16v-5M12 16V8M17 16v-3" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "users":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="1.6" /><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "shield":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3 20 7v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4Z" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "book":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z" stroke="currentColor" strokeWidth="1.6" /><path d="M7 4v18" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "profile":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" /><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" /></svg>;
  }
}

export default function Sidebar() {
  const { state, logout } = useAuth();
  const user = state.user!;
  const items = itemsByRole(user.role);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 2h9l3 3v17H6V2Z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </div>
        <div>
          <div className={styles.brandTitle}>SaludGuard</div>
          <div className={styles.brandSub}>{ROLE_LABELS[user.role] ?? user.role}</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => (isActive ? `${styles.navItem} ${styles.active}` : styles.navItem)}
          >
            <span className={styles.navIcon}><Icon name={it.icon} /></span>
            <span className={styles.navLabel}>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userCard}>
        <div className={styles.avatar}>{user.avatarInitials}</div>
        <div className={styles.userMeta}>
          <div className={styles.userName}>{user.fullName}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>

      <button className={styles.logout} onClick={logout}>
        Cerrar Sesión
      </button>
    </aside>
  );
}
