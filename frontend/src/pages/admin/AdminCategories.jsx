import { useEffect, useState } from "react";
import { categoriesApi } from "../../api/categories";
import "../../styles/AdminCategories.css";

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cats, setCats] = useState([]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [force, setForce] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [savingForm, setSavingForm] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await categoriesApi.getAll();
      setCats(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(typeof e === "string" ? e : "No se pudieron cargar los tipos de alojamiento.");
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

  function openCreate() {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormSlug("");
    setErr("");
    setFormOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setFormName(cat?.name || "");
    setFormDescription(cat?.description || "");
    setFormSlug(cat?.slug || "");
    setErr("");
    setFormOpen(true);
  }

  function closeForm() {
    if (savingForm) return;
    setFormOpen(false);
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormSlug("");
  }

  async function saveForm(e) {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setErr("El nombre es obligatorio.");
      return;
    }

    setSavingForm(true);
    setErr("");

    try {
      const payload = {
        name,
        description: formDescription.trim(),
        slug: formSlug.trim(),
      };

      if (editing?.id) {
        await categoriesApi.update(editing.id, payload);
      } else {
        await categoriesApi.create(payload);
      }

      closeForm();
      await load();
    } catch (e2) {
      setErr(typeof e2 === "string" ? e2 : e2?.message || "No se pudo guardar el tipo.");
    } finally {
      setSavingForm(false);
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
      else setErr("No se pudo eliminar el tipo de alojamiento.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-cats">
      <div className="admin-cats__head">
        <h2>Tipos de alojamiento</h2>
        <div className="admin-cats__actions">
          <button className="admin-cats__btn" type="button" onClick={openCreate} disabled={loading}>
            Nuevo tipo
          </button>
          <button className="admin-cats__btn" type="button" onClick={load} disabled={loading}>
            Recargar
          </button>
        </div>
      </div>

      {loading && <p className="admin-cats__muted">Cargando...</p>}
      {err && !open && <p className="admin-cats__error">{err}</p>}

      {!loading && cats.length === 0 && (
        <p className="admin-cats__muted">No hay tipos de alojamiento cargados.</p>
      )}

      {!loading && cats.length > 0 && (
        <div className="admin-cats__table">
          <div className="admin-cats__row admin-cats__row--head">
            <div>ID</div>
            <div>Nombre</div>
            <div className="admin-cats__right">Acciones</div>
          </div>

          {cats.map((c) => (
            <div className="admin-cats__row" key={c.id}>
              <div className="admin-cats__mono">{c.id}</div>
              <div>{c.name}</div>
              <div className="admin-cats__right">
                <button
                  className="admin-cats__btn"
                  type="button"
                  onClick={() => openEdit(c)}
                >
                  Editar
                </button>
                <button
                  className="admin-cats__btn admin-cats__btn--danger"
                  type="button"
                  onClick={() => openDelete(c)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="admin-modal-backdrop" onMouseDown={closeForm}>
          <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal__title">
              {editing ? "Editar tipo de alojamiento" : "Nuevo tipo de alojamiento"}
            </div>

            <form className="admin-cats__form" onSubmit={saveForm}>
              <label>
                <span>Nombre</span>
                <input
                  className="input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={savingForm}
                  autoFocus
                />
              </label>

              <label>
                <span>Descripcion</span>
                <input
                  className="input"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  disabled={savingForm}
                />
              </label>

              <label>
                <span>Slug</span>
                <input
                  className="input"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  disabled={savingForm}
                  placeholder="ej: cabaña-premium"
                />
              </label>

              {err && <p className="admin-cats__error">{err}</p>}

              <div className="admin-modal__actions">
                <button className="admin-cats__btn" type="button" onClick={closeForm} disabled={savingForm}>
                  Cancelar
                </button>
                <button className="admin-cats__btn" type="submit" disabled={savingForm}>
                  {savingForm ? "Guardando..." : editing ? "Guardar cambios" : "Crear tipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {open && (
        <div className="admin-modal-backdrop" onMouseDown={closeModal}>
          <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal__title">Eliminar tipo de alojamiento</div>

            <p className="admin-modal__text">
              Estas por eliminar: <b>{selected?.name}</b>
            </p>

            <div className="admin-cats__warn">
              <b>Importante:</b>{" "}
              {productCount === null ? (
                <span>
                  Si tiene alojamientos asociados, el sistema evitara borrarlo a menos que actives
                  "Forzar".
                </span>
              ) : productCount === 0 ? (
                <span>No tiene alojamientos asociados.</span>
              ) : (
                <span>
                  Tiene <b>{productCount}</b> alojamiento(s) asociado(s). Si activas "Forzar", se
                  eliminaran tambien.
                </span>
              )}
            </div>

            <label className="admin-cats__check">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                disabled={deleting}
              />
              <span>Forzar (eliminar tambien alojamientos asociados)</span>
            </label>

            {err && <p className="admin-cats__error">{err}</p>}

            <div className="admin-modal__actions">
              <button className="admin-cats__btn" type="button" onClick={closeModal} disabled={deleting}>
                Cancelar
              </button>
              <button
                className="admin-cats__btn admin-cats__btn--danger"
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Confirmar eliminacion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
