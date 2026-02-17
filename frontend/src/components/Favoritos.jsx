// src/pages/Favoritos.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { productsApi } from "../api/products";

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
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];

        if (!alive) return;
        setProducts(list);
      } catch (e) {
        try {
          const r = await fetch("http://localhost:8080/api/products");
          const j = await r.json();
          const list = Array.isArray(j)
            ? j
            : Array.isArray(j?.content)
            ? j.content
            : [];
          if (!alive) return;
          setProducts(list);
        } catch {
          if (!alive) return;
          setError("No se pudieron cargar los productos.");
          setProducts([]);
        }
      } finally {
        if (!alive) return;
        setLoadingProducts(false);
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
      <div style={{ padding: 24 }}>
        <h1>Favoritos</h1>
        <p>Tenés que iniciar sesión para ver tus favoritos.</p>
        <Link to="/login">Ir a login</Link>
      </div>
    );
  }

  if (favLoading || loadingProducts) {
    return <div style={{ padding: 24 }}>Cargando favoritos...</div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Mis favoritos</h1>

      {favoriteIds.size === 0 ? (
        <div style={{ padding: 16, border: "1px solid #333", borderRadius: 12 }}>
          Todavía no marcaste ningún producto como favorito.
        </div>
      ) : favoritesList.length === 0 ? (
        <div style={{ padding: 16, border: "1px solid #333", borderRadius: 12 }}>
          Tenés favoritos guardados, pero no se pudieron emparejar con productos.
          <br />
          (Esto suele pasar si el backend cambió IDs o si el listado viene paginado y no trae todos.)
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {favoritesList.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #333",
                borderRadius: 14,
                padding: 12,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {p.title || p.titulo || p.name || p.nombre || "Producto"}
              </div>

              {p.imageUrl || p.imagenUrl ? (
                <img
                  src={p.imageUrl || p.imagenUrl}
                  alt={p.title || p.titulo || p.name || p.nombre || "Producto"}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                />
              ) : null}

              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  to={`/productos/${p.id}`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  Ver
                </Link>

                <button
                  onClick={() => toggle(p.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ff6b6b",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                  title="Quitar de favoritos"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
