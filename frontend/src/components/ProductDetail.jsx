import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import { DayPicker } from "react-day-picker";
import ShareButton from "../components/ShareButton";
import ReviewsSections from "./ReviewsSections";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "react-day-picker/style.css";

import "../styles/ProductDetail.css";
import "../styles/reservas.css";

import ProductPoliciesBlock from "./ProductPoliciesBlock";

// ✅ NUEVO: API de reservas alineada a tu backend actual
import { reservationsApi } from "../api/reservations";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const FALLBACK = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
  <rect width='100%' height='100%' fill='%23111622'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Segoe UI, Roboto, Arial' font-size='28' fill='%23AAB2C5'>
    Imagen de alojamiento
  </text>
</svg>`;

const toAbsoluteUrl = (u = "") => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:")) return u;

  if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
  if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;

  const clean = u.replace(/^\/+/, "");
  return `${API_BASE}/uploads/${clean}`;
};

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function parseISOToDate(iso) {
  // "YYYY-MM-DD" -> Date local sin TZ issues
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function ProductDetail({ fetchById }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [thumbs, setThumbs] = useState(null);
  const [anim, setAnim] = useState(false);

  const reservableId = useMemo(() => {
    const raw = product?.reservableId ?? null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [product]);
  const [range, setRange] = useState(undefined);
  const [occLoading, setOccLoading] = useState(true);
  const [occError, setOccError] = useState("");
  const [occupiedSet, setOccupiedSet] = useState(new Set());

  const from = useMemo(() => new Date(), []);
  const to = useMemo(() => addDays(new Date(), 120), []);

  const policies = useMemo(() => {
    const raw = product?.policies;

    const fallbackPolicies = [
      {
        title: "Uso adecuado",
        description:
          "El alojamiento debe utilizarse respetando la capacidad y normas del establecimiento.",
      },
      {
        title: "Cuidados generales",
        description:
          "Mantener el espacio en buen estado y respetar horarios de check-in y check-out.",
      },
      {
        title: "Seguridad",
        description:
          "No se permiten eventos no autorizados ni superar la capacidad maxima de huespedes.",
      },
    ];

    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((p) => ({
          title: p?.title ?? p?.name ?? "Política",
          description: p?.description ?? p?.detail ?? "",
        }))
        .filter((p) => p.title && p.description);
    }

    return fallbackPolicies;
  }, [product]);

  const images = useMemo(() => {
    const candidates = [
      product?.imageUrls,
      product?.imagesUrls,
      product?.images,
      product?.imageURL,
      product?.imageUrl,
      product?.image,
      product?.thumbnail,
      product?.mainImage,
      product?.imagePath,
      product?.photo,
      product?.photos,
    ];

    let raw = candidates.find((v) => v != null);

    if (typeof raw === "string") raw = [raw];

    if (raw && !Array.isArray(raw) && typeof raw === "object") {
      raw = [raw.url || raw.path || raw.src || raw.imageUrl || raw.image || raw.fileName || ""];
    }

    const abs = (Array.isArray(raw) ? raw : [])
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object")
          return x.url || x.path || x.src || x.imageUrl || x.image || x.fileName || "";
        return "";
      })
      .map(toAbsoluteUrl)
      .filter(Boolean);

    return abs.length ? abs : [FALLBACK];
  }, [product]);

  const canLoop = images.length > 1;

  const inc = () => setQty((q) => Math.min(q + 1, product?.stock || 99));
  const dec = () => setQty((q) => Math.max(1, q - 1));

  const handleStartAnim = () => {
    setAnim(true);
    if (thumbs) {
      thumbs.allowSlideNext = false;
      thumbs.allowSlidePrev = false;
    }
  };
  const handleEndAnim = () => {
    setAnim(false);
    if (thumbs) {
      thumbs.allowSlideNext = true;
      thumbs.allowSlidePrev = true;
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!fetchById) {
          setError("No se recibió fetchById en la ruta.");
          return;
        }
        const p = await fetchById(id);
        if (!alive) return;

        setProduct(p);

        console.log("PRODUCT RAW:", p);
        console.log("PRODUCT KEYS:", p ? Object.keys(p) : []);
      } catch (e) {
        setError(e?.message || "No se pudo obtener el alojamiento.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, fetchById]);

  // ✅ ACTUALIZADO: ahora carga ocupación desde /api/reservations/reservable/{id}
  async function loadAvailability() {
    if (!reservableId) {
      setOccLoading(false);
      setOccError("Este alojamiento no tiene reservable configurado.");
      return;
    }

    setOccLoading(true);
    setOccError("");

    try {
      // Endpoint público: /api/reservables/{id}/availability
      const availability = await reservationsApi.getAvailability(
        reservableId,
        toISO(from),
        toISO(to)
      );

      const occupied = new Set();

      for (const d of availability?.occupiedDates || []) {
        occupied.add(String(d));
      }

      setOccupiedSet(occupied);
    } catch (e) {
      setOccError(e?.message || "No se pudo cargar la disponibilidad.");
    } finally {
      setOccLoading(false);
    }
  }

  useEffect(() => {
    if (!product) return;
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, reservableId]);

  const disabledDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (day) => {
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      const key = toISO(d);
      return d < today || occupiedSet.has(key);
    };
  }, [occupiedSet]);

  const modifiers = useMemo(() => {
    const occupiedDates = Array.from(occupiedSet).map((iso) => parseISOToDate(iso));
    return { occupied: occupiedDates };
  }, [occupiedSet]);

  const modifiersStyles = useMemo(
    () => ({
      occupied: {
        opacity: 0.45,
        textDecoration: "line-through",
        border: "1px solid rgba(255,255,255,.18)",
      },
    }),
    []
  );

  function goReserve() {
    const start = range?.from ? toISO(range.from) : null;
    const end = range?.to ? toISO(range.to) : null;
    if (!start || !end || !reservableId) return;

    navigate(`/reservas?reservableId=${reservableId}&start=${start}&end=${end}`);
  }

  if (error) {
    return (
      <div className="pdp-page pdp">
        <div className="pdp-top-actions">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </div>

        <div className="pdp-alert">
          <strong>Hubo un problema:</strong>
          <div style={{ marginTop: 8 }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page pdp">
        <div className="pdp-top-actions">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </div>
        <div className="pdp-skeleton" />
      </div>
    );
  }

  return (
    <div className="pdp-page pdp">
      <div className="pdp-top-actions">
        <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
      </div>

      {/* Galería */}
      <div className="pdp-left">
        <section className={`pdp-gallery ${anim ? "is-animating" : ""}`}>
          <Swiper
            className="pdp-main-swiper"
            modules={[Thumbs]}
            spaceBetween={12}
            loop={canLoop}
            speed={600}
            allowTouchMove={canLoop}
            thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
            onTransitionStart={handleStartAnim}
            onTransitionEnd={handleEndAnim}
          >
            {images.map((src, i) => (
              <SwiperSlide key={`main-${i}`}>
                <div className="pdp-main" onMouseDown={(e) => e.preventDefault()}>
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper
            className="pdp-thumbs-swiper"
            modules={[FreeMode, Navigation, Thumbs]}
            onSwiper={setThumbs}
            freeMode={false}
            loop={canLoop}
            navigation={canLoop ? { clickable: true } : false}
            spaceBetween={8}
            slidesPerView={Math.min(4, images.length)}
            speed={600}
            slideToClickedSlide={canLoop}
            watchSlidesProgress={true}
            preventClicks={true}
            preventClicksPropagation={true}
            onTransitionStart={handleStartAnim}
            onTransitionEnd={handleEndAnim}
          >
            {images.map((src, i) => (
              <SwiperSlide key={`thumb-${i}`}>
                <button type="button" className="pdp-thumb" onMouseDown={(e) => e.preventDefault()}>
                  <img src={src} alt={`Miniatura ${i + 1}`} loading="lazy" draggable={false} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section className="pdp-reviews">
          <ReviewsSections productId={id} />
        </section>
      </div>

      {/* Info */}
      <section className="pdp-info">
        <h1 className="pdp-title">{product.name}</h1>

        <div className="pdp-chips">
          {typeof product.stock === "number" && (
            <span className={`chip ${product.stock > 0 ? "ok" : "warn"}`}>
              {product.stock > 0 ? `CAPACIDAD: ${product.stock} HUESPEDES` : "SIN DISPONIBILIDAD"}
            </span>
          )}
          {(product.categoryName || product.category) && (
            <span className="chip ghost">{product.categoryName || product.category}</span>
          )}
        </div>

        <div className="pdp-price">{money(product.price)}</div>

        {product.description && <p className="pdp-desc">{product.description}</p>}

        <div
          style={{ display: "flex", gap: 10, margin: "10px 0 14px", flexWrap: "wrap" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ShareButton product={product} label="Compartir" />
        </div>

        <ProductPoliciesBlock policies={policies} />

        <div className="pdp-actions">
          <div className="qty">
            <button onClick={dec} aria-label="Disminuir">
              −
            </button>
            <input
              value={qty}
              onChange={(e) => {
                const v = parseInt(e.target.value || "1", 10);
                if (!Number.isNaN(v)) {
                  setQty(Math.min(Math.max(v, 1), product.stock || 99));
                }
              }}
              inputMode="numeric"
            />
            <button onClick={inc} aria-label="Aumentar">
              +
            </button>
          </div>

        </div>

        <ul className="pdp-perks">
          <li>Check-in desde las 15:00</li>
          <li>Cancelacion flexible segun tarifa</li>
          <li>Atencion al huesped 24/7</li>
        </ul>
        {Array.isArray(product.amenities) && product.amenities.length > 0 && (
          <ul className="pdp-perks">
            {product.amenities.map((amenity) => (
              <li key={amenity.id || amenity.name}>{amenity.name}</li>
            ))}
          </ul>
        )}
        {/* Reservas */}
        <div style={{ marginTop: 18 }}>
          <div className="cal">
            <div className="cal__header">
              <h3 style={{ margin: 0 }}>Reservar</h3>
              <div className="cal__legend">
                <span className="dot dot--free" /> Disponible
                <span className="dot dot--busy" /> Ocupado
              </div>
            </div>

            {occError && (
              <div className="cal__error">
                <p style={{ margin: 0 }}>❌ {occError}</p>
                <button className="btn" onClick={loadAvailability} style={{ marginTop: 10 }}>
                  Reintentar
                </button>
              </div>
            )}

            {!occError && occLoading && <p className="cal__loading">Cargando fechas…</p>}

            {!occError && !occLoading && (
              <>
                <DayPicker
                  mode="range"
                  numberOfMonths={2}
                  selected={range}
                  onSelect={setRange}
                  disabled={disabledDays}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  fromMonth={from}
                  toMonth={to}
                />

                <button
                  className="btn btn--primary"
                  onClick={goReserve}
                  disabled={!reservableId || !range?.from || !range?.to}
                  title={!reservableId ? "Este alojamiento no es reservable" : !range?.from || !range?.to ? "Selecciona un rango" : "Ir a reservar"}
                >
                  Ir a reservar
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


