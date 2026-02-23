import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productsApi } from "../api/products";
import { categoriesApi } from "../api/categories";
import { adminApi } from "../api/admin";

function toCount(data) {
  return Array.isArray(data) ? data.length : 0;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      const [productsRes, categoriesRes, usersRes] = await Promise.allSettled([
        productsApi.getAll(),
        categoriesApi.getAll(),
        adminApi.getUsers(),
      ]);

      if (!active) return;

      setStats({
        products:
          productsRes.status === "fulfilled" ? toCount(productsRes.value) : 0,
        categories:
          categoriesRes.status === "fulfilled" ? toCount(categoriesRes.value) : 0,
        users: usersRes.status === "fulfilled" ? toCount(usersRes.value) : 0,
      });

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        key: "products",
        label: "Alojamientos",
        value: stats.products,
        hint: "Items activos en el catalogo",
      },
      {
        key: "categories",
        label: "Tipos",
        value: stats.categories,
        hint: "Categorias disponibles para clasificar",
      },
      {
        key: "users",
        label: "Usuarios",
        value: stats.users,
        hint: "Cuentas registradas en la plataforma",
      },
    ],
    [stats]
  );

  return (
    <div className="ap-dashboard">
      <section className="ap-hero">
        <div>
          <p className="ap-hero__kicker">Bienvenido al panel</p>
          <h2>Hola, {user?.name || "Admin"}</h2>
          <p>
            Desde este espacio podes gestionar alojamientos, categorias y permisos
            de usuarios sin salir del flujo administrativo.
          </p>
        </div>

        <div className="ap-hero__actions">
          <Link to="/administracion/alojamientos/nuevo" className="btn">
            Crear alojamiento
          </Link>
          <Link to="/administracion/usuarios" className="btn btn-ghost">
            Revisar usuarios
          </Link>
        </div>
      </section>

      <section className="ap-kpi-grid">
        {cards.map((card) => (
          <article className="ap-kpi-card" key={card.key}>
            <p>{card.label}</p>
            <strong>{loading ? "..." : card.value}</strong>
            <span>{card.hint}</span>
          </article>
        ))}
      </section>

      <section className="ap-dashboard-grid">
        <article className="ap-card">
          <h3>Checklist rapido</h3>
          <ul className="ap-checklist">
            <li>Verifica alojamientos sin imagenes actualizadas.</li>
            <li>Revisa permisos de nuevos usuarios registrados.</li>
            <li>Elimina tipos de alojamiento que no esten en uso.</li>
          </ul>
        </article>

        <article className="ap-card">
          <h3>Atajos de gestion</h3>
          <div className="ap-links-grid">
            <Link to="/administracion/alojamientos" className="ap-link-tile">
              Administrar alojamientos
            </Link>
            <Link to="/administracion/tipos-alojamiento" className="ap-link-tile">
              Gestionar tipos
            </Link>
            <Link to="/administracion/usuarios" className="ap-link-tile">
              Configurar usuarios
            </Link>
            <Link to="/administracion/reservas" className="ap-link-tile">
              Ver modulo de reservas
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
