import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { reservationsApi } from "../api/reservations";
import { productsApi } from "../api/products";
import { AUTH_TOKEN_KEY } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "../styles/reservas.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const FALLBACK_IMAGE = "/placeholder.jpg";

function toAbsoluteImage(url = "") {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  if (url.startsWith("uploads/")) return `${API_BASE}/${url}`;
  return `${API_BASE}/uploads/${url.replace(/^\/+/, "")}`;
}

function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function splitName(name) {
  const fullName = String(name || "").trim();
  if (!fullName) {
    return { firstName: "No informado", lastName: "No informado" };
  }
  const parts = fullName.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "No informado" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function Reservas() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const reservableId = params.get("reservableId");
  const start = params.get("start");
  const end = params.get("end");

  const reservableIdNumber = useMemo(() => {
    const parsed = Number(reservableId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [reservableId]);

  const startDate = useMemo(() => parseISODate(start), [start]);
  const endDate = useMemo(() => parseISODate(end), [end]);
  const isDateRangeValid = Boolean(startDate && endDate && startDate <= endDate);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState("");
  const [reservable, setReservable] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadDetails() {
      if (!reservableIdNumber) {
        setDetailsError("El alojamiento enviado no es valido.");
        setDetailsLoading(false);
        return;
      }

      setDetailsLoading(true);
      setDetailsError("");

      try {
        const [reservableData, products] = await Promise.all([
          reservationsApi.getReservable(reservableIdNumber),
          productsApi.getAll().catch(() => []),
        ]);

        if (!mounted) return;

        setReservable(reservableData || null);

        const list = Array.isArray(products) ? products : [];
        const matchingProduct = list.find(
          (item) => Number(item?.reservableId) === reservableIdNumber
        );

        setProduct(matchingProduct || null);
      } catch (e) {
        if (!mounted) return;
        setDetailsError(e?.message || "No se pudo cargar el detalle del alojamiento.");
      } finally {
        if (mounted) setDetailsLoading(false);
      }
    }

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [reservableIdNumber]);

  const userData = useMemo(() => splitName(user?.name), [user?.name]);
  const productImage = useMemo(() => {
    const firstImage = product?.imageUrls?.[0];
    return toAbsoluteImage(firstImage) || FALLBACK_IMAGE;
  }, [product]);

  const canSubmit = Boolean(reservableIdNumber && isDateRangeValid && !loading);

  async function confirmReservation() {
    if (!reservableIdNumber || !isDateRangeValid || !startDate || !endDate) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await reservationsApi.createReservation({
        reservableId: reservableIdNumber,
        startDate: toISO(startDate),
        endDate: toISO(endDate),
      });

      setMessage({ type: "success", text: "Reserva confirmada correctamente." });
      const redirectTo = product?.id ? `/alojamientos/${product.id}` : "/";
      setTimeout(() => navigate(redirectTo), 900);
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("turmalin:user");
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        navigate(`/login?redirect=${redirect}`);
        return;
      }
      setMessage({ type: "error", text: e?.message || "No se pudo crear la reserva." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page reservation-page">
      <div className="reservation-layout">
        <section className="reservation-panel">
          <h2>Detalle del alojamiento</h2>

          {detailsLoading && <p className="reservation-muted">Cargando detalle...</p>}

          {!detailsLoading && detailsError && (
            <p className="reservation-error">{detailsError}</p>
          )}

          {!detailsLoading && !detailsError && (
            <div className="reservation-product">
              <img src={productImage} alt="Alojamiento" />
              <div className="reservation-product__content">
                <h3>{product?.name || reservable?.name || `Alojamiento #${reservableIdNumber}`}</h3>
                <p>
                  {product?.description ||
                    reservable?.description ||
                    "Sin descripcion disponible."}
                </p>
                <div className="reservation-tags">
                  <span className="reservation-tag">
                    Tipo: {reservable?.type || "PRODUCT"}
                  </span>
                  {product?.categoryName && (
                    <span className="reservation-tag">Tipo: {product.categoryName}</span>
                  )}
                  {typeof product?.price !== "undefined" && (
                    <span className="reservation-tag">Precio: ${product.price}</span>
                  )}
                </div>
                {product?.id && (
                  <Link className="reservation-link" to={`/alojamientos/${product.id}`}>
                    Ver detalle completo del alojamiento
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="reservation-panel">
          <h2>Datos para la reserva</h2>

          <div className="reservation-grid">
            <div>
              <span className="reservation-label">Nombre</span>
              <p>{userData.firstName}</p>
            </div>
            <div>
              <span className="reservation-label">Apellido</span>
              <p>{userData.lastName}</p>
            </div>
            <div className="reservation-grid__full">
              <span className="reservation-label">Correo electronico</span>
              <p>{user?.email || "No informado"}</p>
            </div>
          </div>

          <div className="reservation-dates">
            <h3>Periodo seleccionado</h3>
            <p>
              <strong>Desde:</strong> {startDate ? formatDate(startDate) : "-"}
            </p>
            <p>
              <strong>Hasta:</strong> {endDate ? formatDate(endDate) : "-"}
            </p>
            {!isDateRangeValid && (
              <p className="reservation-error">
                El rango recibido no es valido. Volve al detalle y selecciona fechas validas.
              </p>
            )}
          </div>

          {message.text && (
            <p
              className={
                message.type === "success" ? "reservation-success" : "reservation-error"
              }
            >
              {message.text}
            </p>
          )}

          <button
            className="btn btn--primary"
            onClick={confirmReservation}
            disabled={!canSubmit}
          >
            {loading ? "Confirmando..." : "Confirmar reserva"}
          </button>
        </section>
      </div>
    </div>
  );
}

