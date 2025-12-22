import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../../api/products";
import "../../styles/AdminPanel.css";

export default function AdminProductsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await productsApi.getAll();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await productsApi.remove(id);
      setRows((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("No se pudo eliminar");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="admin-content fixed-offset">
        <p>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="admin-content fixed-offset">
      <div className="admin-header">
        <h1>Lista de productos</h1>
        <button
          className="btn-primary"
          type="button"
            onClick={() => navigate("/admin/productos/nuevo")}
        >
          + Agregar
        </button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Nombre</th>
              <th style={{ width: 320 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td
                  className="actions"
                  style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/productos/${p.id}`)}
                    style={{
                      minWidth: 88,
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid #2f3550",
                      background: "#252a3b",
                      color: "#e5e9f5",
                      fontWeight: 600,
                    }}
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/administracion/productos/editar/${p.id}`)
                    }
                    style={{
                      minWidth: 88,
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid #3a4670",
                      background: "#2a3551",
                      color: "#fff",
                      fontWeight: 600,
                      boxShadow: "0 0 0 1px rgba(58,70,112,.25)",
                    }}
                    title="Editar producto"
                    aria-label={`Editar ${p.name}`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    style={{
                      minWidth: 88,
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid #5a2b3d",
                      background: "#3a2430",
                      color: "#ffd7df",
                      fontWeight: 600,
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", opacity: 0.7 }}>
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
