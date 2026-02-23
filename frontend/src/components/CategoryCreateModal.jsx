import { useState } from "react";
import { createPortal } from "react-dom";
import { categoriesApi } from "../api/categories";

export default function CategoryCreateModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const close = () => {
    setName(""); setDescription(""); setSlug("");
    setSaving(false); setError("");
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) { setError("El nombre es obligatorio"); return; }

    try {
      setSaving(true);
      const payload = { name: trimmed, description, slug };
      const created = await categoriesApi.create(payload);
      onCreated?.(created);
      close();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el tipo de alojamiento");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={close}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3>Nuevo tipo de alojamiento</h3>

        <form onSubmit={handleSubmit} onKeyDown={(e)=> e.stopPropagation()}>
          {error && <div className="alert error">{error}</div>}

          <label className="row">
            <span>Nombre</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </label>

          <label className="row">
            <span>Descripción (opcional)</span>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </label>

          <label className="row">
            <span>Slug (opcional)</span>
            <input
              className="input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={saving}
              placeholder="ej: suite-ejecutiva"
            />
          </label>

          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={close} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}


