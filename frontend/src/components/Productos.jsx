import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { productsApi } from "../api/products";
import { useAuth } from "../context/AuthContext";
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

const PAGE_SIZE = 10;

const toAbsoluteUrl = (u = "") => {
  if (!u) return "";
  const s = u.replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return API_BASE + s;
  const clean = s.replace(/^\/+/, "");
  return `${API_BASE}/uploads/${clean}`;
};

function isAdminUser(user) {
  if (!user) return false;
  if (user.admin === true) return true;
  const role = String(user.role || "").toUpperCase();
  return role === "ADMIN" || role === "ROLE_ADMIN";
}

export default function Productos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [allItems, setAllItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advFilterIds, setAdvFilterIds] = useState(null);

  const categoryId = Number(searchParams.get("category"));
  const hasCategoryFilter = Number.isFinite(categoryId) && categoryId > 0;
  const showAdminActions = isAdminUser(user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productsApi.getAll();
        if (cancelled) return;
        setAllItems(Array.isArray(data) ? data : []);
      } catch {
        if (cancelled) return;
        setError("No se pudo cargar alojamientos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onProductsRoute =
      location.pathname.startsWith("/alojamientos") || location.pathname.startsWith("/productos");
    if (!onProductsRoute) return;

    try {
      const raw = localStorage.getItem("advSearch");
      if (!raw) {
        setAdvFilterIds(null);
        return;
      }
      const parsed = JSON.parse(raw);
      const ids = Array.isArray(parsed?.results)
        ? parsed.results.map((item) => Number(item?.id)).filter((id) => Number.isFinite(id))
        : [];
      setAdvFilterIds(new Set(ids));
      localStorage.removeItem("advSearch");
    } catch {
      setAdvFilterIds(null);
    }
  }, [location.pathname, location.search]);

  const filteredItems = useMemo(() => {
    let list = Array.isArray(allItems) ? allItems : [];

    if (hasCategoryFilter) {
      list = list.filter((p) => Number(p?.categoryId ?? p?.category?.id) === categoryId);
    }

    if (advFilterIds instanceof Set) {
      list = list.filter((p) => advFilterIds.has(Number(p?.id)));
    }

    return list;
  }, [allItems, hasCategoryFilter, categoryId, advFilterIds]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const items = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [hasCategoryFilter, categoryId, advFilterIds]);

  const getCardImage = (product) => {
    const raw = product?.imageUrls ?? product?.imagesUrls ?? [];
    const first = Array.isArray(raw) ? raw[0] : "";
    const src = toAbsoluteUrl(first || "");
    return src || FALLBACK_IMG;
  };

  const getCategoryName = (category, categoryName) => {
    if (typeof categoryName === "string" && categoryName.trim()) return categoryName;
    return typeof category === "string" ? category : category?.name;
  };

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
          {showAdminActions && (
            <button
              className="addProductButton"
              onClick={() => navigate("/administracion/alojamientos/nuevo")}
            >
              Agregar alojamiento
            </button>
          )}
        </div>

        {!items.length && <p className="products-empty">No hay alojamientos para los filtros actuales.</p>}

        <div className="grid">
          {items.map((p, idx) => {
            const goDetail = () => navigate(`/alojamientos/${p.id}`, { state: { product: p } });
            const categoryName = getCategoryName(p?.category, p?.categoryName);

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
            onClick={() => setPage(1)}
            disabled={page <= 1}
            aria-label="Ir al inicio"
            title="Inicio"
          >
            {"<<"}
          </button>
          <button
            className="pag-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Pagina anterior"
            title="Anterior"
          >
            {"<"}
          </button>

          <span className="page-info">
            Pagina <b>{Math.min(page, totalPages)}</b> de <b>{totalPages}</b> - <b>{total}</b> alojamientos
          </span>

          <button
            className="pag-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Pagina siguiente"
            title="Siguiente"
          >
            {">"}
          </button>
          <button
            className="pag-btn"
            onClick={() => setPage(totalPages)}
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
