import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../../api/products";
import "../../styles/AddProduct.css";

export default function AddProduct() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [images, setImages] = useState([]); // Array<File>
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Selecciona VARIAS a la vez (Ctrl/Shift)
  function onPickImages(e) {
    const picked = Array.from(e.target.files || []);
    setImages(picked);
    e.target.value = null; // permite volver a elegir lo mismo
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.name.trim() || !form.description.trim()) {
        throw new Error("Nombre y descripción son obligatorios.");
      }

      // 👉 FormData para enviar múltiples archivos reales
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", String(Number(form.price || 0)));
      fd.append("stock", String(Number(form.stock || 0)));
      fd.append("category", form.category.trim());
      for (const file of (images ?? [])) fd.append("images", file);

      await productsApi.create(fd); // fetch con body: fd (sin Content-Type manual)
      nav("/productos");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear el producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main container add-product-page" style={{ maxWidth: 720 }}>
      <h1>Agregar producto</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Nombre *
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ej: SSD 1TB"
          />
        </label>

        <label>
          Descripción *
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={onChange}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Precio
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
            />
          </label>
          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={onChange}
            />
          </label>
        </div>

        <label>
          Categoría
          <input
            name="category"
            value={form.category}
            onChange={onChange}
            placeholder="Hardware / Servicios"
          />
        </label>

        <label>
          Imágenes (una o varias)
          <input type="file" name="images" accept="image/*" multiple onChange={onPickImages} />
        </label>

        {images.length > 0 && (
          <>
            <p style={{ marginTop: 8 }}>Seleccionadas: {images.length}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 8,
                marginTop: 8,
              }}
            >
              {images.map((f) => {
                const src = URL.createObjectURL(f);
                return (
                  <img
                    key={`${f.name}-${f.size}-${f.lastModified}`}
                    src={src}
                    alt={f.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                );
              })}
            </div>

            <ul style={{ marginTop: 8 }}>
              {images.map((f) => (
                <li key={`name-${f.name}-${f.lastModified}`}>
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </>
        )}

        {error && <p style={{ color: "#f55" }}>{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => nav(-1)}>Cancelar</button>
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>
      </form>
    </main>
  );
}
