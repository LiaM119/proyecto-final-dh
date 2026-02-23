import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../../styles/AdminPanel.css";
import AdminMenu from "../../components/AdminMenu";

const quickLinks = [
  { to: "/administracion/alojamientos", label: "Alojamientos" },
  { to: "/administracion/tipos-alojamiento", label: "Tipos" },
  { to: "/administracion/usuarios", label: "Usuarios" },
  { to: "/administracion/reservas", label: "Reservas" },
];

function getSection(pathname) {
  if (pathname.startsWith("/administracion/alojamientos/editar")) {
    return {
      title: "Editar alojamiento",
      description: "Actualiza datos, imagenes y capacidad del alojamiento.",
    };
  }

  if (pathname.startsWith("/administracion/alojamientos/nuevo")) {
    return {
      title: "Nuevo alojamiento",
      description: "Publica un nuevo alojamiento en pocos pasos.",
    };
  }

  if (pathname.startsWith("/administracion/alojamientos")) {
    return {
      title: "Alojamientos",
      description: "Gestion completa del catalogo y acciones de publicacion.",
    };
  }

  if (pathname.startsWith("/administracion/productos")) {
    return {
      title: "Alojamientos",
      description: "Gestion completa del catalogo y acciones de publicacion.",
    };
  }

  if (pathname.startsWith("/administracion/tipos-alojamiento")) {
    return {
      title: "Tipos de alojamiento",
      description: "Organiza categorias y elimina tipos sin uso.",
    };
  }

  if (pathname.startsWith("/administracion/usuarios")) {
    return {
      title: "Usuarios",
      description: "Administra permisos y visibilidad de cuentas.",
    };
  }

  if (pathname.startsWith("/administracion/reservas")) {
    return {
      title: "Reservas",
      description: "Vista de reservas administrativas (modulo en progreso).",
    };
  }

  return {
    title: "Dashboard",
    description: "Resumen operativo y accesos rapidos del panel.",
  };
}

export default function AdminPanel() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMenuOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setMenuOpen(false);
  }, [location.pathname, isMobile]);

  const section = useMemo(() => getSection(location.pathname), [location.pathname]);

  return (
    <div className={`ap-panel${isMobile ? " is-mobile" : ""}`}>
      {isMobile && menuOpen && (
        <button
          type="button"
          className="ap-sidebar-backdrop"
          aria-label="Cerrar menu de administracion"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`ap-sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="ap-brand">
          <span className="ap-dot" />
          <h2>Administracion</h2>
          <p>Turmalin Control Center</p>
        </div>

        <nav className="ap-menu">
          <AdminMenu onNavigate={() => isMobile && setMenuOpen(false)} />
        </nav>

        <div className="ap-meta">
          <span className="ap-tag">v1.1</span>
          <span className="ap-muted">Turmalin</span>
        </div>
      </aside>

      <main className="ap-content">
        <header className="ap-toolbar">
          <div className="ap-toolbar-main">
            {isMobile && (
              <button
                type="button"
                className="ap-menu-toggle"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? "Cerrar menu" : "Abrir menu"}
              </button>
            )}

            <div>
              <p className="ap-kicker">Panel de administracion</p>
              <h3 className="ap-title">{section.title}</h3>
              <p className="ap-subtitle">{section.description}</p>
            </div>
          </div>

          <div className="ap-actions">
            {quickLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ap-chip${isActive ? " is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>

        <section className="ap-outlet">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
