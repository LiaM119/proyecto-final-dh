import { useEffect, useState } from "react";
import { categoriesApi } from "../../api/categories";
import "../../styles/adminCategories.css";

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cats, setCats] = useState([]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [force, setForce] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await categoriesApi.getAll();
      setCats(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(typeof e === "string" ? e : "No se pudieron cargar las categorías.");
      setCats([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDelete(cat) {
    setSelected(cat);
    setForce(false);
    setProductCount(null);
    setErr("");
    setOpen(true);

    try {
      const r = await categoriesApi.productCount(cat.id);
      setProductCount(r?.productCount ?? null);
    } catch {
      setProductCount(null);
    }
  }

  function closeModal() {
    if (deleting) return;
    setOpen(false);
    setSelected(null);
    setProductCount(null);
    setForce(false);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    setErr("");

    try {
      await categoriesApi.remove(selected.id, { force });
      setOpen(false);
      setSelected(null);
      await load();
    } catch (e) {
      if (typeof e === "string") setErr(e);
      else setErr("No se pudo eliminar la categoría.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="adminCats">
      <div className="adminCats__head">
        <h2>Categorías</h2>
        <button className="btn" onClick={load} disabled={loading}>
          Recargar
        </button>
      </div>

      {loading && <p className="muted">Cargando...</p>}
      {err && !open && <p className="error">{err}</p>}

      {!loading && cats.length === 0 && (
        <p className="muted">No hay categorías cargadas.</p>
      )}

      {!loading && cats.length > 0 && (
        <div className="table">
          <div className="row row--head">
            <div>ID</div>
            <div>Nombre</div>
            <div className="right">Acciones</div>
          </div>

          {cats.map((c) => (
            <div className="row" key={c.id}>
              <div className="mono">{c.id}</div>
              <div>{c.name}</div>
              <div className="right">
                <button className="btn btn--danger" onClick={() => openDelete(c)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="modalBackdrop" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal__title">Eliminar categoría</div>

            <p className="modal__text">
              Estás por eliminar: <b>{selected?.name}</b>
            </p>

            <div className="warnBox">
              <b>Importante:</b>{" "}
              {productCount === null ? (
                <span>
                  Si tiene productos asociados, el sistema evitará borrarla a menos que actives
                  “Forzar”.
                </span>
              ) : productCount === 0 ? (
                <span>No tiene productos asociados.</span>
              ) : (
                <span>
                  Tiene <b>{productCount}</b> producto(s) asociado(s). Si activás “Forzar”, se
                  eliminarán también.
                </span>
              )}
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                disabled={deleting}
              />
              <span>Forzar (eliminar también productos asociados)</span>
            </label>

            {err && <p className="error">{err}</p>}

            <div className="modal__actions">
              <button className="btn" onClick={closeModal} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn--danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
