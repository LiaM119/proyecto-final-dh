import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { categoriesApi } from "../api/categories";
import SearchBlock from "./SearchBlock.jsx";
import "../styles/Header.css";
import "../styles/AdvancedSearchModal.css";

export default function Header() {
  const { user, token, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const [openAdv, setOpenAdv] = useState(false);
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando categorías", e);
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:8080/api/products");
        const j = await r.json();
        const list = Array.isArray(j)
          ? j
          : Array.isArray(j?.content)
          ? j.content
          : [];
        setProducts(list);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenAdv(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (openAdv) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [openAdv]);

  const goToAll = () => {
    navigate("/alojamientos");
    setOpen(false);
  };

  const goToCategory = (id) => {
    navigate(`/alojamientos?category=${id}`);
    setOpen(false);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <>
      <header className="hdr" role="banner">
        <div className="hdr__inner">
          <Link to="/" className="hdr__logo">Turmalin</Link>

          <nav className="hdr__nav" aria-label="Primary">
            {/* Dropdown alojamientos */}
            <div className="hdr__dropdown" ref={boxRef}>
              <button
                type="button"
                className={`hdr__link hdr__link--btn ${open ? "is-open" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
              >
                Alojamientos
              </button>

              {open && (
                <div className="hdr__menu" role="menu">
                  <button
                    className="hdr__item hdr__item--top"
                    onClick={goToAll}
                    role="menuitem"
                  >
                    Ver todos
                  </button>

                  <div className="hdr__sep" />

                  {categories.length === 0 ? (
                    <div className="hdr__item hdr__item--muted">
                      No hay tipos de alojamiento
                    </div>
                  ) : (
                    categories.map((c) => (
                      <button
                        key={c.id}
                        className="hdr__item"
                        onClick={() => goToCategory(c.id)}
                        role="menuitem"
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <NavLink to="/contacto" className="hdr__link">
              Contacto
            </NavLink>

            <button
              type="button"
              className="hdr__advBtn"
              onClick={() => setOpenAdv(true)}
            >
              Búsqueda avanzada
            </button>

            {/* Auth */}
            {!isAuthenticated ? (
              <>
                <NavLink to="/register" className="hdr__btn">
                  Crear cuenta
                </NavLink>
                <NavLink to="/login" className="hdr__btn hdr__btn--ghost">
                  Iniciar sesión
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/favoritos" className="hdr__link">
                  Favoritos
                </NavLink>
                <NavLink to="/mis-reservas" className="hdr__link">
                  Mis reservas
                </NavLink>
                <span className="hdr__user">
                  {user.name || "Usuario"}
                </span>
                <button
                  className="hdr__btn hdr__btn--danger"
                  onClick={logout}
                >
                  Salir
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* MODAL BÚSQUEDA AVANZADA */}
      {openAdv && (
        <div className="advModal" onMouseDown={() => setOpenAdv(false)}>
          <div
            className="advModal__panel"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="advModal__top">
              <h3 className="advModal__title">Búsqueda avanzada</h3>
              <button
                type="button"
                className="advModal__close"
                onClick={() => setOpenAdv(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <SearchBlock
              products={products}
              onSearch={(results, meta) => {
                localStorage.setItem(
                  "advSearch",
                  JSON.stringify({ results, meta, ts: Date.now() })
                );
                navigate("/alojamientos");
                setOpenAdv(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}


