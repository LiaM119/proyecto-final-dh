import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/AdminPanel.css";

function isAdminUser(user) {
  if (!user) return false;
  if (user.admin === true) return true;
  const role = String(user.role || "").toUpperCase();
  return role === "ADMIN" || role === "ROLE_ADMIN";
}

export default function AdminUsers() {
  const { user: currentUser, setUser: setAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleAdmin = async (u) => {
    try {
      setSavingId(u.id);
      const updated = await adminApi.setAdmin(u.id, !isAdminUser(u));

      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      if (currentUser && currentUser.id === updated.id) {
        setAuthUser(updated);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al actualizar permisos.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <p className="admin-muted">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <p className="admin-error">{error}</p>
        <button type="button" className="btn btn-secondary" onClick={loadUsers}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1>Gestion de usuarios</h1>
          <p className="admin-subtitle">Asigna o quita permisos de administrador.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="admin-muted">No hay usuarios registrados.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th style={{ width: 140 }}>Rol</th>
                <th style={{ width: 160 }}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = isAdminUser(u);

                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name || "-"}</td>
                    <td>{u.email}</td>
                    <td>{isAdmin ? "ADMIN" : "USER"}</td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${isAdmin ? "btn-danger" : "btn-secondary"}`}
                        onClick={() => handleToggleAdmin(u)}
                        disabled={savingId === u.id}
                      >
                        {savingId === u.id
                          ? "Guardando..."
                          : isAdmin
                          ? "Quitar admin"
                          : "Hacer admin"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
