import { useEffect, useState } from "react";
import { amenitiesApi } from "../../api/amenities";
import "../../styles/AdminCategories.css";

const emptyForm = { name: "", description: "", icon: "" };

export default function AdminAmenities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await amenitiesApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las caracteristicas.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
    setError("");
  }

  function startEdit(item) {
    setEditing(item);
    setForm({
      name: item?.name || "",
      description: item?.description || "",
      icon: item?.icon || "",
    });
    setOpenForm(true);
    setError("");
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon.trim(),
      };
      if (editing?.id) await amenitiesApi.update(editing.id, payload);
      else await amenitiesApi.create(payload);
      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (e2) {
      setError(e2?.message || "No se pudo guardar la caracteristica.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const confirmed = window.confirm(`Eliminar "${item?.name}"?`);
    if (!confirmed) return;
    setError("");
    try {
      await amenitiesApi.remove(item.id);
      await load();
    } catch (e) {
      setError(e?.message || "No se pudo eliminar la caracteristica.");
    }
  }

  return (
    <div className="admin-cats">
      <div className="admin-cats__head">
        <h2>Caracteristicas</h2>
        <div className="admin-cats__actions">
          <button className="admin-cats__btn" type="button" onClick={startCreate} disabled={loading}>
            Nueva caracteristica
          </button>
          <button className="admin-cats__btn" type="button" onClick={load} disabled={loading}>
            Recargar
          </button>
        </div>
      </div>

      {loading && <p className="admin-cats__muted">Cargando...</p>}
      {error && <p className="admin-cats__error">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="admin-cats__muted">No hay caracteristicas cargadas.</p>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-cats__table">
          <div className="admin-cats__row admin-cats__row--head">
            <div>ID</div>
            <div>Nombre</div>
            <div className="admin-cats__right">Acciones</div>
          </div>

          {items.map((item) => (
            <div className="admin-cats__row" key={item.id}>
              <div className="admin-cats__mono">{item.id}</div>
              <div>{item.name}</div>
              <div className="admin-cats__right">
                <button className="admin-cats__btn" type="button" onClick={() => startEdit(item)}>
                  Editar
                </button>
                <button
                  className="admin-cats__btn admin-cats__btn--danger"
                  type="button"
                  onClick={() => remove(item)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openForm && (
        <div className="admin-modal-backdrop" onMouseDown={() => !saving && setOpenForm(false)}>
          <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal__title">
              {editing ? "Editar caracteristica" : "Nueva caracteristica"}
            </div>

            <form className="admin-cats__form" onSubmit={submitForm}>
              <label>
                <span>Nombre</span>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={saving}
                />
              </label>

              <label>
                <span>Descripcion</span>
                <input
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={saving}
                />
              </label>

              <label>
                <span>Icono (texto opcional)</span>
                <input
                  className="input"
                  value={form.icon}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                  disabled={saving}
                  placeholder="wifi, pool, tv..."
                />
              </label>

              <div className="admin-modal__actions">
                <button className="admin-cats__btn" type="button" onClick={() => setOpenForm(false)} disabled={saving}>
                  Cancelar
                </button>
                <button className="admin-cats__btn" type="submit" disabled={saving}>
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
