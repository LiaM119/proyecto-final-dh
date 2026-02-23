import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { productsApi } from "../../api/products";
import CategorySelect from "../../components/CategorySelect";
import "../../styles/AdminPanel.css";

const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";
const toAbsoluteUrl = (u = "") => {
  if (!u) return "";
  const s = u.replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return API_BASE + s;
  const clean = s.replace(/^\/+/, "");
  return `${API_BASE}/uploads/${clean}`;
};

const emptyForm = {
  id: null,
  name: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrls: [],
  categoryId: null,
  categoryName: "",
};

export default function AddProduct() {
  const navigate = useNavigate();
  const params = useParams();
  const [search] = useSearchParams();
  const routeId = params?.id || search.get("id");

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!!routeId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [files, setFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 

  useEffect(() => {
    if (!routeId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const p = await productsApi.getById(routeId);
        if (!alive) return;

        const catId = p.categoryId ?? p.category?.id ?? null;
        const catName =
          p.category?.name ??
          p.categoryName ??
          (typeof p.category === "string" ? p.category : "") ??
          "";

        setForm({
          id: p.id ?? null,
          name: p.name || "",
          description: p.description || "",
          price: Number(p.price ?? 0),
          stock: Number(p.stock ?? 0),
          imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
          categoryId: catId,
          categoryName: catName,
        });
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el alojamiento.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [routeId]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const onPickFiles = (e) => {
    const sel = Array.from(e.target.files || []);
    previews.forEach((url) => URL.revokeObjectURL(url)); 
    setFiles(sel);
    const urls = sel.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (Number.isNaN(Number(form.price))) return setError("Precio inválido");
    if (Number.isNaN(Number(form.stock))) return setError("Capacidad invalida");

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId ?? null,
        files, 
      };

      if (routeId) {
        await productsApi.updateMultipart(routeId, payload);
      } else {
        await productsApi.createMultipart(payload);
      }

      navigate("/administracion/alojamientos");
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el alojamiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-addproduct container" style={{ maxWidth: 720 }}>
      <h1>{routeId ? "Editar alojamiento" : "Registrar alojamiento"}</h1>

      <form className="form" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}

        <div className="row">
          <label>Nombre</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={saving}
            required
          />
        </div>

        <div className="row">
          <label>Descripción</label>
          <textarea
            className="textarea"
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            disabled={saving}
          />
        </div>

        <div
          className="row"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label className="row">
            <span>Tarifa por noche</span>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              disabled={saving}
            />
          </label>

          <label className="row">
            <span>Capacidad maxima (huespedes)</span>
            <input
              className="input"
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              disabled={saving}
            />
          </label>
        </div>

        <div className="row">
          <CategorySelect
            value={
              form.categoryId
                ? { id: form.categoryId, name: form.categoryName }
                : form.categoryName
                ? { id: null, name: form.categoryName }
                : null
            }
            onChange={(cat) =>
              setForm((f) => ({
                ...f,
                categoryId: cat?.id ?? null,
                categoryName: cat?.name ?? "",
              }))
            }
            disabled={loading || saving}
          />
        </div>

        {routeId &&
          Array.isArray(form.imageUrls) &&
          form.imageUrls.length > 0 && (
            <div className="row">
              <label>Imágenes actuales</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
                  gap: 8,
                }}
              >
                {form.imageUrls.map((src, i) => (
                  <img
                    key={i}
                    src={toAbsoluteUrl(src)}
                    alt={`img-${i}`}
                    style={{
                      width: "100%",
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid rgba(175, 149, 236, 0.34)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        <div className="row">
          <label>Nuevas imágenes (opcional)</label>
          <input
            className="input-file"
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            disabled={saving}
          />
          {previews.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
                gap: 8,
                marginTop: 8,
              }}
            >
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`prev-${i}`}
                  style={{
                    width: "100%",
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid rgba(175, 149, 236, 0.34)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Guardando..." : routeId ? "Guardar cambios" : "Crear"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


