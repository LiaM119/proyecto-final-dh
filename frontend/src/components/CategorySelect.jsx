// src/components/CategorySelect.jsx
import { useEffect, useState } from "react";
import { categoriesApi } from "../api/categories";
import CategoryCreateModal from "./CategoryCreateModal";

export default function CategorySelect({ value, onChange, disabled }) {
  const [items, setItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedId = value?.id ?? null;

  const handleSelect = (e) => {
    const id = e.target.value ? Number(e.target.value) : null;
    const cat = items.find((x) => x.id === id) || null;
    onChange?.(cat ? { id: cat.id, name: cat.name } : null);
  };

  const handleCreated = (created) => {
    load().then(() => {
      onChange?.({ id: created.id, name: created.name });
    });
  };

  return (
    <div className="row">
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1 }}>Tipo de alojamiento</span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setOpenModal(true)}
          disabled={disabled || loading}
        >
          + Nuevo tipo
        </button>
      </label>

      <select
        className="select"
        value={selectedId ?? ""}
        onChange={handleSelect}
        disabled={disabled || loading}
      >
        <option value="">— Sin tipo —</option>
        {items.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <CategoryCreateModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

