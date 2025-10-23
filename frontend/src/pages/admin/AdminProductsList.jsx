import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../../api/products";
import "../../styles/AdminPanel.css";

export default function AdminProductsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await productsApi.getAll(); // ← antes llamaba a .list()
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await productsApi.remove(id);
      setRows(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("No se pudo eliminar");
      console.error(e);
    }
  };

  if (loading) return <div className="admin-content"><p>Cargando…</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Lista de productos</h1>
        <button className="btn-primary" onClick={() => navigate("/admin/productos/nuevo")}>
          + Agregar
        </button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{width:80}}>ID</th>
              <th>Nombre</th>
              <th style={{width:220}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/productos/${p.id}`)}>Ver</button>
                  <button onClick={() => navigate(`/admin/add-product?id=${p.id}`)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{textAlign:"center", opacity:.7}}>No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
