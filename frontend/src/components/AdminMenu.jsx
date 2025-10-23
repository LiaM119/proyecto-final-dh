import { NavLink } from "react-router-dom";
import "../styles/AdminPanel.css";

export default function AdminMenu() {
  return (
    <aside className="admin-menu">
      <h2>Administración</h2>
      <nav>
        <ul>
          <li><NavLink to="/admin/productos/nuevo">Agregar producto</NavLink></li>
          <li><NavLink to="/administracion/productos">Lista de productos</NavLink></li>
          <li><button type="button" disabled>Gestión de usuarios</button></li>
          <li><button type="button" disabled>Reservas</button></li>
        </ul>
      </nav>
    </aside>
  );
}
