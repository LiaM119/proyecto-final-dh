// src/components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { categoriesApi } from "../api/categories";
import "../styles/Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
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
    const onDown = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const goToAll = () => {
    navigate("/productos");
    setOpen(false);
  };

  const goToCategory = (id) => {
    navigate(`/productos?category=${id}`);
    setOpen(false);
  };

  return (
    <header className="hdr" role="banner">
      <div className="hdr__inner">
        <Link to="/" className="hdr__logo">Turmalin</Link>

        <nav className="hdr__nav" aria-label="Primary">
          <div className="hdr__dropdown" ref={boxRef}>
            <button
              type="button"
              className={`hdr__link hdr__link--btn ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
            >
              Productos <span className="hdr__caret">▾</span>
            </button>

            {open && (
              <div className="hdr__menu" role="menu">
                <button className="hdr__item hdr__item--top" onClick={goToAll} role="menuitem">
                  Ver todos
                </button>

                <div className="hdr__sep" />

                {categories.length === 0 ? (
                  <div className="hdr__item hdr__item--muted">No hay categorías</div>
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

          <NavLink to="/contacto" className="hdr__link">Contacto</NavLink>

          {!user ? (
            <>
              <NavLink to="/register" className="hdr__btn">Crear cuenta</NavLink>
              <NavLink to="/login" className="hdr__btn hdr__btn--ghost">Iniciar sesión</NavLink>
            </>
          ) : (
            <>
              <span className="hdr__user">{user.name || "Usuario"}</span>
              <button className="hdr__btn hdr__btn--danger" onClick={logout}>Salir</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
