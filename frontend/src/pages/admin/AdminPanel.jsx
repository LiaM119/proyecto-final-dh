// src/pages/admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import "../../styles/AdminPanel.css";
import AdminMenu from "../../components/AdminMenu";

export default function AdminPanel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="admin-mobile-block">
        <h2>Panel no disponible en dispositivos móviles</h2>
      </div>
    );
  }

  return (
    <div className="ap-panel">
      <aside className="ap-sidebar">
        <div className="ap-brand">
          <span className="ap-dot" />
          <h2>Administración</h2>
          <p>Servicio Técnico de PC</p>
        </div>

        <nav className="ap-menu">
          <AdminMenu />
        </nav>

        <div className="ap-meta">
          <span className="ap-tag">v1.0</span>
          <span className="ap-muted">Turmalin</span>
        </div>
      </aside>

      <main className="ap-content">
        <header className="ap-toolbar">
          <h3>Panel de Administración</h3>

          <div className="ap-actions">
            <Link to="/administracion/productos" className="ap-chip">
              Productos
            </Link>

            <Link to="/administracion/categorias" className="ap-chip">
              Categorías
            </Link>

            <Link to="/administracion/usuarios" className="ap-chip">
              Usuarios
            </Link>

            <Link to="/administracion/reservas" className="ap-chip">
              Reservas
            </Link>
          </div>
        </header>

        <div className="ap-outlet">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
