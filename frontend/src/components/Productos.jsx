import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../api/products";
import "../styles/Productos.css";
import ImageCarousel from "./ImageCarousel";
import { useNavigate } from "react-router-dom";

/* BASE única */
const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";

/* Normalizador de URLs */
const toAbsoluteUrl = (u = "") => {
  if (!u) return "";
  const s = u.replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return API_BASE + s;
  const clean = s.replace(/^\/+/, "");
  return `${API_BASE}/uploads/${clean}`;
};

const PAGE_SIZE = 10;

export default function Productos() {
  const navigate = useNavigate();

  // Estado general
  const [items, setItems] = useState([]);        // items de la página actual
  const [total, setTotal] = useState(0);         // total de productos
  const [page, setPage] = useState(1);           // 1-based
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Para fallback de paginación en cliente
  const [allItems, setAllItems] = useState(null); // null = modo server; [] = modo client

  // Carga cada vez que cambia la página
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");

      // 1) Intento de paginación en servidor (Spring Page<>)
      try {
        const res = await fetch(
          `${API_BASE}/api/products?page=${page - 1}&size=${PAGE_SIZE}`
        );
        if (res.ok) {
          const data = await res.json();
          if (
            data &&
            Array.isArray(data.content) &&
            typeof data.totalElements === "number"
          ) {
            if (cancelled) return;
            setItems(data.content);
            setTotal(data.totalElements);
            setTotalPages(Math.max(1, data.totalPages || 1));
            setAllItems(null); // estamos en modo server
            setLoading(false);
            return;
          }
        }
        // Si no vino como Page<>, continuamos a fallback
      } catch (_) {
        // sigue al fallback
      }

      // 2) Fallback: traer todo y paginar en cliente
      try {
        const data = await productsApi.getAll();
        const list = Array.isArray(data) ? data : [];
        if (cancelled) return;

        const tp = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        const safePage = Math.min(Math.max(1, page), tp);
        const start = (safePage - 1) * PAGE_SIZE;
        const slice = list.slice(start, start + PAGE_SIZE);

        setAllItems(list);
        setItems(slice);
        setTotal(list.length);
        setTotalPages(tp);
        if (safePage !== page) setPage(safePage); // corrige si nos pasamos
        setLoading(false);
      } catch (_) {
        if (cancelled) return;
        setError("No se pudo cargar productos");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Si estamos en modo cliente, recalcular página al cambiar total (por borrados/altas)
  useEffect(() => {
    if (!allItems) return; // solo en cliente
    const tp = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
    if (page > tp) setPage(tp);
  }, [allItems]);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  if (loading) {
    return (
      <main className="main container products-page">
        <p>Cargando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main container products-page">
        <p style={{ color: "#f55" }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="main container products-page">
      <div className="products-header">
        <h1>Productos</h1>
        <button
          className="addProductButton"
          onClick={() => navigate("/admin/productos/nuevo")}
        >
          Agregar producto
        </button>
      </div>

      {!items.length && <p>No hay productos en esta página.</p>}

      <div className="grid">
        {items.map((p) => {
          const raw = p?.imageUrls ?? p?.imagesUrls ?? [];
          const imgs = raw.map(toAbsoluteUrl).filter(Boolean);

          return (
            <article
              key={p.id}
              className="product-card"
              onClick={() =>
                navigate(`/productos/${p.id}`, { state: { product: p } })
              }
              onKeyDown={(e) =>
                e.key === "Enter"
                  ? navigate(`/productos/${p.id}`, { state: { product: p } })
                  : null
              }
              tabIndex={0}
            >
              <div className="card-media">
                {imgs.length ? (
                  <ImageCarousel
                    images={imgs}
                    onErrorSrc={`data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
  <rect width='100%' height='100%' fill='%23111622'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Segoe UI, Roboto, Arial' font-size='28' fill='%23AAB2C5'>
    Imagen de producto
  </text>
</svg>`}
                  />
                ) : (
                  <div className="ic-empty">Sin imágenes</div>
                )}
              </div>

              <h3 className="product-title">{p.name}</h3>
              <p className="product-desc">{p.description}</p>

              <div className="product-meta">
                <strong>${p.price}</strong>
                <span>Stock: {p.stock}</span>
                {p.category && <span>• {p.category}</span>}
              </div>
            </article>
          );
        })}
      </div>

      {/* PAGINADOR */}
      <nav className="paginator" aria-label="Paginación de productos">
        <button
          className="pag-btn"
          onClick={goFirst}
          disabled={page <= 1}
          aria-label="Ir al inicio"
          title="Inicio"
        >
          «
        </button>
        <button
          className="pag-btn"
          onClick={goPrev}
          disabled={page <= 1}
          aria-label="Página anterior"
          title="Anterior"
        >
          ‹
        </button>

        <span className="page-info">
          Página <b>{page}</b> de <b>{totalPages}</b>
        </span>

        <button
          className="pag-btn"
          onClick={goNext}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          title="Siguiente"
        >
          ›
        </button>
        <button
          className="pag-btn"
          onClick={goLast}
          disabled={page >= totalPages}
          aria-label="Ir al final"
          title="Final"
        >
          »
        </button>
      </nav>
    </main>
  );
}
