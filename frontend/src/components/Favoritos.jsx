import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { productsApi } from "../api/products";
import "../styles/Favoritos.css";

const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";

function toAbsoluteUrl(u = "") {
  if (!u) return "";
  const s = String(u).replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
}

function getCardImage(product) {
  const raw = [
    product?.imageUrls,
    product?.imagesUrls,
    product?.images,
    product?.imageUrl,
    product?.imagenUrl,
    product?.image,
  ].find((value) => value != null);

  const first = Array.isArray(raw) ? raw[0] : raw;
  return toAbsoluteUrl(first || "");
}

export default function Favoritos() {
  const { favoriteIds, loading: favLoading, toggle, isLogged } = useFavorites();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoadingProducts(true);

        const data = await productsApi.getAll?.();
        const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];

        if (!alive) return;
        setProducts(list);
      } catch {
        try {
          const r = await fetch("http://localhost:8080/api/products");
          const j = await r.json();
          const list = Array.isArray(j) ? j : Array.isArray(j?.content) ? j.content : [];
          if (!alive) return;
          setProducts(list);
        } catch {
          if (!alive) return;
          setError("No se pudieron cargar los alojamientos.");
          setProducts([]);
        }
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const favoritesList = useMemo(() => {
    const ids = new Set([...favoriteIds].map(Number));
    return products.filter((p) => ids.has(Number(p.id)));
  }, [products, favoriteIds]);

  if (!isLogged) {
    return (
      <main className="fav-page">
        <section className="fav-shell">
          <h1 className="fav-title">Favoritos</h1>
          <p className="fav-copy">Tenes que iniciar sesion para ver tus favoritos.</p>
          <Link to="/login" className="fav-link-btn">
            Ir a login
          </Link>
        </section>
      </main>
    );
  }

  if (favLoading || loadingProducts) {
    return (
      <main className="fav-page">
        <section className="fav-shell">
          <p className="fav-copy">Cargando favoritos...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="fav-page">
        <section className="fav-shell">
          <p className="fav-error">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="fav-page">
      <section className="fav-shell">
        <h1 className="fav-title">Mis favoritos</h1>

        {favoriteIds.size === 0 ? (
          <div className="fav-empty">Todavia no marcaste ningun alojamiento como favorito.</div>
        ) : favoritesList.length === 0 ? (
          <div className="fav-empty">
            Tenes favoritos guardados, pero no se pudieron emparejar con alojamientos.
          </div>
        ) : (
          <div className="fav-grid">
            {favoritesList.map((p) => {
              const image = getCardImage(p);
              const title = p.title || p.titulo || p.name || p.nombre || "Alojamiento";

              return (
                <article key={p.id} className="fav-card">
                  {image ? (
                    <img src={image} alt={title} className="fav-card-img" loading="lazy" />
                  ) : (
                    <div className="fav-card-placeholder">Sin imagen</div>
                  )}

                  <div className="fav-card-body">
                    <h3 className="fav-card-title">{title}</h3>

                    <div className="fav-actions">
                      <Link to={`/alojamientos/${p.id}`} className="fav-btn fav-btn-view">
                        Ver
                      </Link>

                      <button
                        onClick={() => toggle(p.id)}
                        className="fav-btn fav-btn-remove"
                        title="Quitar de favoritos"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
