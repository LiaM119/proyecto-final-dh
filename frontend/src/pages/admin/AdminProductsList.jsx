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
    if (!confirm("Eliminar este alojamiento?")) return;

    try {
      await productsApi.remove(id);
      setRows((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      if (e?.status === 404) {
        setRows((prev) => prev.filter((p) => p.id !== id));
        return;
      }
      alert(e?.message || "No se pudo eliminar el alojamiento.");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <p className="admin-muted">Cargando alojamientos...</p>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1>Lista de alojamientos</h1>
          <p className="admin-subtitle">Edita o elimina alojamientos publicados.</p>
        </div>

        <button
          className="btn"
          type="button"
          onClick={() => navigate("/administracion/alojamientos/nuevo")}
        >
          + Agregar
        </button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 88 }}>ID</th>
              <th>Nombre</th>
              <th style={{ width: 300 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td className="admin-table__actions">
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => navigate(`/alojamientos/${p.id}`)}>
                    Ver
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/administracion/alojamientos/editar/${p.id}`)}
                    title="Editar alojamiento"
                    aria-label={`Editar ${p.name}`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="admin-empty">
                  No hay alojamientos cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
