import { Link } from "react-router-dom";
import "../../styles/AdminPanel.css";

export default function AdminReservations() {
  return (
    <div className="admin-content">
      <div className="admin-placeholder">
        <h2>Modulo de reservas administrativas</h2>
        <p>
          Esta seccion esta en desarrollo. Pronto vas a poder ver, filtrar y gestionar
          reservas desde el panel.
        </p>

        <div className="admin-placeholder__actions">
          <Link className="btn btn-ghost" to="/mis-reservas">
            Ver mis reservas
          </Link>
          <Link className="btn btn-secondary" to="/administracion/alojamientos">
            Volver a alojamientos
          </Link>
        </div>
      </div>
    </div>
  );
}
