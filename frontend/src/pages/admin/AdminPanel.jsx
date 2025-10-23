import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
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
    <div className="admin-panel">
      <AdminMenu />
      <div className="admin-outlet">
        <Outlet />
      </div>
    </div>
  );
}