import { NavLink } from "react-router-dom";
import "../styles/AdminPanel.css";

const items = [
  { to: "/administracion", label: "Dashboard", short: "DB", end: true },
  { to: "/administracion/alojamientos", label: "Alojamientos", short: "AL" },
  { to: "/administracion/alojamientos/nuevo", label: "Nuevo alojamiento", short: "NV" },
  { to: "/administracion/tipos-alojamiento", label: "Tipos", short: "TP" },
  { to: "/administracion/usuarios", label: "Usuarios", short: "US" },
];

export default function AdminMenu({ onNavigate }) {
  return (
    <nav className="admin-menu" aria-label="Navegacion de administracion">
      <p className="admin-menu__title">Navegacion</p>

      <ul className="admin-menu__list">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-menu__link${isActive ? " is-active" : ""}`
              }
              onClick={onNavigate}
            >
              <span className="admin-menu__pill" aria-hidden>
                {item.short}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}

        <li>
          <span className="admin-menu__soon">Reservas: proximo modulo</span>
        </li>
      </ul>
    </nav>
  );
}
