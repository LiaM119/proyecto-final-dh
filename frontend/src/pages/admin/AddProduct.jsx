import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { productsApi } from "../../api/products";
import { amenitiesApi } from "../../api/amenities";
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
  amenityIds: [],
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
  const [amenities, setAmenities] = useState([]);

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
          amenityIds: Array.isArray(p.amenityIds)
            ? p.amenityIds.map(Number).filter((n) => Number.isFinite(n))
            : Array.isArray(p.amenities)
            ? p.amenities.map((a) => Number(a?.id)).filter((n) => Number.isFinite(n))
            : [],
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
    let active = true;
    (async () => {
      try {
        const data = await amenitiesApi.getAll();
        if (!active) return;
        setAmenities(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setAmenities([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const onPickFiles = (e) => {
    const sel = Array.from(e.target.files || []);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(sel);
    setPreviews(sel.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) return setError("El nombre es obligatorio.");
    if (!form.description.trim()) return setError("La descripcion es obligatoria.");
    if (!Number.isFinite(price) || price <= 0) return setError("El precio debe ser mayor a 0.");
    if (!Number.isFinite(stock) || stock <= 0) return setError("La capacidad debe ser mayor a 0.");
    if (!Number.isInteger(stock)) return setError("La capacidad debe ser un numero entero.");
    if (!form.categoryId) return setError("Debes seleccionar una categoria.");
    if (!routeId && files.length === 0) return setError("Debes subir al menos una imagen.");

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        stock,
        categoryId: form.categoryId ?? null,
        amenityIds: form.amenityIds || [],
        files,
      };

      if (routeId) await productsApi.updateMultipart(routeId, payload);
      else await productsApi.createMultipart(payload);

      navigate("/administracion/alojamientos");
    } catch (err) {
      console.error(err);
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
          <label>Descripcion</label>
          <textarea
            className="textarea"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            disabled={saving}
            required
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
              min="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              disabled={saving}
              required
            />
          </label>

          <label className="row">
            <span>Capacidad maxima (huespedes)</span>
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              disabled={saving}
              required
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

        <div className="row">
          <label>Caracteristicas (amenities)</label>
          <select
            className="select"
            multiple
            value={(form.amenityIds || []).map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions || [])
                .map((option) => Number(option.value))
                .filter((n) => Number.isFinite(n));
              setForm((prev) => ({ ...prev, amenityIds: selected }));
            }}
            disabled={saving}
            style={{ minHeight: 140 }}
          >
            {amenities.map((amenity) => (
              <option key={amenity.id} value={amenity.id}>
                {amenity.name}
              </option>
            ))}
          </select>
        </div>

        {routeId && Array.isArray(form.imageUrls) && form.imageUrls.length > 0 && (
          <div className="row">
            <label>Imagenes actuales</label>
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
          <label>{routeId ? "Nuevas imagenes (opcional)" : "Imagenes (obligatorio)"}</label>
          <input
            className="input-file"
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            disabled={saving}
            required={!routeId}
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
