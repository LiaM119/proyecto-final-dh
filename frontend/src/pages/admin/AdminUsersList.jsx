// frontend/src/pages/admin/AdminUsersList.jsx
import { useEffect, useState } from "react";
import { usersApi } from "../../api/users";
import "../../styles/AdminPanel.css"; 

export default function AdminUsersList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await usersApi.getAll();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleRole = async (u) => {
    const toAdmin = u.role !== "ROLE_ADMIN";

    const ok = confirm(
      `¿Seguro que querés ${toAdmin ? "hacer ADMIN" : "volver a USER"} a ${u.email}?`
    );
    if (!ok) return;

    try {
      if (toAdmin) {
        await usersApi.makeAdmin(u.id);
      } else {
        await usersApi.makeUser(u.id);
      }

      setRows((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? { ...x, role: toAdmin ? "ROLE_ADMIN" : "ROLE_USER" }
            : x
        )
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el rol");
    }
  };

  if (loading) {
    return <div className="admin-content fixed-offset">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="admin-content fixed-offset">{error}</div>;
  }

  return (
    <div className="admin-content fixed-offset">
      <h1>Usuarios</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.role === "ROLE_ADMIN" ? "Admin" : "Usuario"}</td>
              <td>
                <button
                  className="btn-small"
                  onClick={() => handleToggleRole(u)}
                  disabled={u.email === "admin@demo.com"} 
                >
                  {u.role === "ROLE_ADMIN" ? "Quitar admin" : "Hacer admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
