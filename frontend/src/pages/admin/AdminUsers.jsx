// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { useAuth } from "../../context/AuthContext.jsx";

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
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar usuarios");
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
      const updated = await adminApi.setAdmin(u.id, !u.admin);

      setUsers((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
      if (currentUser && currentUser.id === updated.id) {
        setAuthUser(updated);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al actualizar permisos");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Cargando usuarios...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "tomato" }}>{error}</p>
        <button onClick={loadUsers}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Gestión de usuarios</h2>
      <p>Asignar o quitar permisos de administrador.</p>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Admin</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.id}</td>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.role || (u.admin ? "ADMIN" : "USER")}</td>
                <td style={tdStyle}>{u.admin ? "Sí" : "No"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleAdmin(u)}
                    disabled={savingId === u.id}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: u.admin ? "#e74c3c" : "#2ecc71",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    {savingId === u.id
                      ? "Guardando..."
                      : u.admin
                      ? "Quitar admin"
                      : "Hacer admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid #333",
};

const tdStyle = {
  padding: "8px 6px",
  borderBottom: "1px solid #222",
};
