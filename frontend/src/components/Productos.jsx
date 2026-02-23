import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/products";
import FavoriteButton from "./FavoriteButton";
import ShareButton from "./ShareButton";
import "../styles/Productos.css";

const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0%' stop-color='#1c2240'/><stop offset='100%' stop-color='#0f1325'/>" +
      "</linearGradient></defs>" +
      "<rect width='800' height='500' fill='url(#g)'/>" +
      "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#cfc5f5' " +
      "font-family='Arial, sans-serif' font-size='34'>Turmalin</text></svg>"
  );

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

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allItems, setAllItems] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

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
            setAllItems(null);
            setLoading(false);
            return;
          }
        }
      } catch {
        void 0;
      }

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
        if (safePage !== page) setPage(safePage);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("No se pudo cargar alojamientos");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!allItems) return;
    const tp = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
    if (page > tp) setPage(tp);
  }, [allItems, page]);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  const getCardImage = (product) => {
    const raw = product?.imageUrls ?? product?.imagesUrls ?? [];
    const first = Array.isArray(raw) ? raw[0] : "";
    const src = toAbsoluteUrl(first || "");
    return src || FALLBACK_IMG;
  };

  const getCategoryName = (category) =>
    typeof category === "string" ? category : category?.name;

  if (loading) {
    return (
      <main className="main products-page">
        <div className="products-shell">
          <p className="products-empty">Cargando...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main products-page">
        <div className="products-shell">
          <p className="products-error">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main products-page">
      <div className="products-shell">
        <div className="products-header">
          <h1>Alojamientos</h1>
          <button
            className="addProductButton"
            onClick={() => navigate("/admin/alojamientos/nuevo")}
          >
            Agregar alojamiento
          </button>
        </div>

        {!items.length && <p className="products-empty">No hay alojamientos en esta pagina.</p>}

        <div className="grid">
          {items.map((p, idx) => {
            const goDetail = () =>
              navigate(`/alojamientos/${p.id}`, { state: { product: p } });
            const categoryName = getCategoryName(p?.category);

            return (
              <article
                key={p?.id ?? `product-${idx}`}
                className="product-card"
                onClick={goDetail}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goDetail();
                }}
                tabIndex={0}
              >
                <div
                  className="product-card-actions product-card-actions--left"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <FavoriteButton productId={p.id} />
                </div>

                <div
                  className="product-card-actions product-card-actions--right"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ShareButton product={p} className="product-share-btn" label="Compartir" />
                </div>

                <div className="product-media-frame">
                  <img src={getCardImage(p)} alt={p?.name || "Alojamiento"} loading="lazy" />
                </div>

                <h3 className="product-title">{p.name}</h3>
                <p className="product-desc">{p.description}</p>

                <div className="product-meta">
                  <strong>${p.price}</strong>
                  <span>Capacidad: {p.stock} huespedes</span>
                  {categoryName && <span>- {categoryName}</span>}
                </div>
              </article>
            );
          })}
        </div>

        <nav className="paginator" aria-label="Paginacion de alojamientos">
          <button
            className="pag-btn"
            onClick={goFirst}
            disabled={page <= 1}
            aria-label="Ir al inicio"
            title="Inicio"
          >
            {"<<"}
          </button>
          <button
            className="pag-btn"
            onClick={goPrev}
            disabled={page <= 1}
            aria-label="Pagina anterior"
            title="Anterior"
          >
            {"<"}
          </button>

          <span className="page-info">
            Pagina <b>{page}</b> de <b>{totalPages}</b>
            {typeof total === "number" ? (
              <>
                {" "}
                - <b>{total}</b> alojamientos
              </>
            ) : null}
          </span>

          <button
            className="pag-btn"
            onClick={goNext}
            disabled={page >= totalPages}
            aria-label="Pagina siguiente"
            title="Siguiente"
          >
            {">"}
          </button>
          <button
            className="pag-btn"
            onClick={goLast}
            disabled={page >= totalPages}
            aria-label="Ir al final"
            title="Final"
          >
            {">>"}
          </button>
        </nav>
      </div>
    </main>
  );
}
