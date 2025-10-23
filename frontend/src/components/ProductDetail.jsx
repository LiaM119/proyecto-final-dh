import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "../styles/ProductDetail.css";

/* BASE del backend: usa VITE_API o localhost:8080 */
const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";

/* Fallback inline */
const FALLBACK = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
  <rect width='100%' height='100%' fill='%23111622'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Segoe UI, Roboto, Arial' font-size='28' fill='%23AAB2C5'>
    Imagen de producto
  </text>
</svg>`;

/* Normaliza a URL absoluta */
const toAbsoluteUrl = (u = "") => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:")) return u;
  if (u.startsWith("/uploads/")) return API_BASE + u;
  const clean = u.replace(/^\/+/, "");
  return `${API_BASE}/uploads/${clean}`;
};

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

export default function ProductDetail({ fetchById }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [thumbs, setThumbs] = useState(null); // instancia del swiper de miniaturas
  const [anim, setAnim] = useState(false);    // bloquea spam mientras anima

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!fetchById) {
          setError("No se recibió fetchById en la ruta.");
          return;
        }
        const p = await fetchById(id);
        if (alive) setProduct(p);
      } catch (e) {
        setError(e?.message || "No se pudo obtener el producto.");
      }
    })();
    return () => { alive = false; };
  }, [id, fetchById]);

  const images = useMemo(() => {
    const raw = product?.imageUrls ?? product?.imagesUrls ?? [];
    const abs = (Array.isArray(raw) ? raw : []).map(toAbsoluteUrl).filter(Boolean);
    return abs.length ? abs : [FALLBACK];
  }, [product]);

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

  if (error) {
    return (
      <div className="pdp container">
        <div className="pdp-top-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
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
      <div className="pdp container">
        <div className="pdp-top-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </div>
        <div className="pdp-skeleton" />
      </div>
    );
  }

  return (
    <div className="pdp container">
      {/* Botón volver alineado a la derecha */}
      <div className="pdp-top-actions">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
      </div>

      {/* Galería */}
      <section className={`pdp-gallery ${anim ? "is-animating" : ""}`}>
        {/* Swiper principal */}
        <Swiper
          className="pdp-main-swiper"
          modules={[Thumbs]}
          spaceBetween={12}
          loop={true}
          loopedSlides={images.length}
          speed={600}
          allowTouchMove={false}
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

        {/* Carrusel de miniaturas */}
        <Swiper
          className="pdp-thumbs-swiper"
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbs}
          freeMode={false}
          loop={true}
          loopedSlides={images.length}
          navigation={{ clickable: true }}
          spaceBetween={8}
          slidesPerView={3}
          speed={600}
          slideToClickedSlide={true}
          watchSlidesProgress={true}
          preventClicks={true}
          preventClicksPropagation={true}
          onTransitionStart={handleStartAnim}
          onTransitionEnd={handleEndAnim}
        >
          {images.map((src, i) => (
            <SwiperSlide key={`thumb-${i}`}>
              <button
                type="button"
                className="pdp-thumb"
                onMouseDown={(e) => e.preventDefault()}
              >
                <img src={src} alt={`Miniatura ${i + 1}`} loading="lazy" draggable={false} />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Info */}
      <section className="pdp-info">
        <h1 className="pdp-title">{product.name}</h1>

        <div className="pdp-chips">
          {typeof product.stock === "number" && (
            <span className={`chip ${product.stock > 0 ? "ok" : "warn"}`}>
              {product.stock > 0 ? `EN STOCK: ${product.stock}` : "SIN STOCK"}
            </span>
          )}
          {product.category && <span className="chip ghost">{product.category}</span>}
        </div>

        <div className="pdp-price">{money(product.price)}</div>

        {product.description && <p className="pdp-desc">{product.description}</p>}

        <div className="pdp-actions">
          <div className="qty">
            <button onClick={dec} aria-label="Disminuir">−</button>
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
            <button onClick={inc} aria-label="Aumentar">+</button>
          </div>

          <div className="cta">
            <button className="btn primary">Comprar ahora</button>
            <button className="btn">Agregar al carrito</button>
          </div>
        </div>

        <ul className="pdp-perks">
          <li>🚚 Envío a todo el país</li>
          <li>🛡️ Garantía oficial 12 meses</li>
          <li>💬 Soporte post-venta</li>
        </ul>
      </section>
    </div>
  );
}
