import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reservationsApi } from "../api/reservations";
import { AUTH_TOKEN_KEY } from "../api/http";
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

function formatDate(value) {
  if (!value) return "-";

  const normalized = String(value).includes("T") ? String(value) : `${value}T00:00:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseSortableDate(value) {
  if (!value) return 0;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function statusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "CONFIRMED":
      return "Confirmada";
    case "ACTIVE":
      return "Activa";
    case "CANCELLED":
      return "Cancelada";
    default:
      return "Sin estado";
  }
}

export default function MyReservationHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const data = await reservationsApi.getMyHistory();
      const list = Array.isArray(data) ? data : [];
      setHistory(list);
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("turmalin:user");
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        navigate(`/login?redirect=${redirect}`);
        return;
      }

      setError(e?.message || "No se pudo cargar tu historial de reservas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const byReservedAt = parseSortableDate(b?.reservedAt) - parseSortableDate(a?.reservedAt);
      if (byReservedAt !== 0) return byReservedAt;
      return parseSortableDate(b?.startDate) - parseSortableDate(a?.startDate);
    });
  }, [history]);

  return (
    <div className="page reservation-history-page">
      <section className="reservation-panel">
        <div className="reservation-history__top">
          <h1>Mi historial de reservas</h1>
          <p>Listado ordenado por fecha de reserva (mas recientes primero).</p>
        </div>

        {loading && <p className="reservation-muted">Cargando historial...</p>}

        {!loading && error && (
          <div className="reservation-history__error">
            <p className="reservation-error">{error}</p>
            <button className="btn" onClick={loadHistory}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && sortedHistory.length === 0 && (
          <div className="reservation-history__empty">
            <p>Aun no tenes reservas registradas.</p>
            <Link className="reservation-link" to="/alojamientos">
              Explorar alojamientos
            </Link>
          </div>
        )}

        {!loading && !error && sortedHistory.length > 0 && (
          <div className="reservation-history__list">
            {sortedHistory.map((item) => {
              const image = toAbsoluteImage(item?.productImageUrl) || FALLBACK_IMAGE;
              const productName = item?.productName || `Reservable #${item?.reservableId || "-"}`;
              const normalizedStatus = String(item?.status || "").toLowerCase();

              return (
                <article key={item?.id} className="reservation-history__item">
                  <img
                    src={image}
                    alt={productName}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                  <div className="reservation-history__content">
                    <div className="reservation-history__header">
                      <h2>{productName}</h2>
                      <span className={`reservation-status reservation-status--${normalizedStatus}`}>
                        {statusLabel(item?.status)}
                      </span>
                    </div>

                    <div className="reservation-history__meta">
                      <p>
                        <strong>Fecha de reserva:</strong> {formatDateTime(item?.reservedAt)}
                      </p>
                      <p>
                        <strong>Uso desde:</strong> {formatDate(item?.startDate)}
                      </p>
                      <p>
                        <strong>Uso hasta:</strong> {formatDate(item?.endDate)}
                      </p>
                    </div>

                    <div className="reservation-history__actions">
                      {item?.productId ? (
                        <Link className="reservation-link" to={`/alojamientos/${item.productId}`}>
                          Ver detalle del alojamiento
                        </Link>
                      ) : (
                        <span className="reservation-muted">Detalle de alojamiento no disponible</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

