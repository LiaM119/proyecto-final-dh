import "../styles/Home.css";
import { BedDouble, Zap, Shield, Settings, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const FALLBACK_PRODUCTS = [
  { id: "ph1", name: "Alojamiento demo 1", price: 0, imageUrls: [] },
  { id: "ph2", name: "Alojamiento demo 2", price: 0, imageUrls: [] },
  { id: "ph3", name: "Alojamiento demo 3", price: 0, imageUrls: [] },
];
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

export default function Home() {

  useEffect(() => {
    const cards = document.querySelectorAll(".why-card");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const scrollToWhy = () => {
    const nextSection = document.querySelector(".why");
    if (!nextSection) return;
    const start = window.scrollY;
    const end = nextSection.getBoundingClientRect().top + window.scrollY;
    const distance = end - start;
    const duration = 900;
    let startTime = null;

    const easing = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + distance * easing(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const [raw, setRaw] = useState(FALLBACK_PRODUCTS);
  const products = useMemo(() => (Array.isArray(raw) ? raw : []), [raw]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    let active = true;

    (async () => {
      try {
        const r = await fetch("http://localhost:8080/api/products", { signal: controller.signal });
        const j = await r.json();
        const list = Array.isArray(j)
          ? j
          : Array.isArray(j?.content)
          ? j.content
          : [];

        if (!list.length) throw new Error("No hay alojamientos");

        const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
        if (active) setRaw(shuffled);
      } catch {
        if (active) setRaw(FALLBACK_PRODUCTS);
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const getImg = (p) => {
    const u = p?.imageUrls?.[0];
    if (typeof u !== "string" || !u.trim()) return FALLBACK_IMG;
    if (u.startsWith("/placeholder")) return u;
    return u.startsWith("http") ? u : `http://localhost:8080${u}`;
  };

  const handleOpen = (p) => {
    if (typeof p?.id === "number") navigate(`/alojamientos/${p.id}`);
  };
  const isClickable = (p) => typeof p?.id === "number";
  const hasMultipleSlides = products.length > 1;
  const isSingleSlide = products.length === 1;

  const renderProductCard = (p) => (
    <article
      className={`ts-card ${isClickable(p) ? "clickable" : "disabled"}`}
      role={isClickable(p) ? "button" : "group"}
      tabIndex={isClickable(p) ? 0 : -1}
      onClick={() => handleOpen(p)}
      onKeyDown={(e) => {
        if (!isClickable(p)) return;
        if (e.key === "Enter" || e.key === " ") handleOpen(p);
      }}
      aria-label={isClickable(p) ? `Ver ${p?.name}` : p?.name}
    >
      <div className="ts-img">
        <img src={getImg(p)} alt={p?.name || "Alojamiento"} />
      </div>
      <div className="ts-info">
        <h3 title={p?.name}>{p?.name ?? "Alojamiento"}</h3>
        {p?.price != null && <p className="price">${p.price}</p>}
      </div>
    </article>
  );

  return (
    <>
      {/* HERO */}
      <section className="home">
        <div className="home-hero-inner">
          <h1 className="home-hero-title">Bienvenido a Turmalin</h1>
          <p className="home-hero-subtitle">Experiencias de hoteleria que se reservan en minutos.</p>
        </div>
        <div className="scroll-arrow" onClick={scrollToWhy} aria-label="Bajar">
          <ChevronDown size={42} />
        </div>
      </section>

      {/* WHY */}
      <section className="why">
        <h2>Por que elegir Turmalin</h2>
        <p>Ofrecemos herramientas claras para publicar, reservar y administrar alojamientos sin friccion.</p>

        <div className="why-grid">
          <div className="why-card">
            <BedDouble size={36} />
            <h3>Catalogo completo</h3>
            <p>Explora una amplia variedad de alojamientos disponibles</p>
          </div>
          <div className="why-card">
            <Zap size={36} />
            <h3>Reservas rapidas</h3>
            <p>Sistema de reservas instantaneo y facil de usar</p>
          </div>
          <div className="why-card">
            <Shield size={36} />
            <h3>Seguro y confiable</h3>
            <p>Tus datos y reservas estan protegidos</p>
          </div>
          <div className="why-card">
            <Settings size={36} />
            <h3>Gestion facil</h3>
            <p>Panel de administracion intuitivo</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="home-products" id="home-products">
        <h2 className="home-products-title">Que alojamientos puedo encontrar en Turmalin</h2>

        {products.length === 0 ? (
          <p className="home-products-loading">No hay alojamientos disponibles por ahora.</p>
        ) : (
          <div className="home-swiper-wrap">
            <Swiper
              modules={[Navigation]}
              centeredSlides={hasMultipleSlides}
              slidesPerView={isSingleSlide ? 1 : "auto"}
              spaceBetween={16}
              loop={false}
              navigation={hasMultipleSlides ? { nextEl: ".nav-next", prevEl: ".nav-prev" } : false}
              grabCursor={hasMultipleSlides}
              allowTouchMove={hasMultipleSlides}
              watchOverflow
              className={`turmalin-swiper${isSingleSlide ? " is-single" : ""}`}
              breakpoints={{ 0: { spaceBetween: 12 }, 768: { spaceBetween: 16 } }}
            >
              {products.map((p, idx) => (
                <SwiperSlide key={`${p?.id ?? p?.name}-${idx}`} className="ts-slide">
                  {renderProductCard(p)}
                </SwiperSlide>
              ))}
            </Swiper>

            {hasMultipleSlides && (
              <>
                <button className="nav-btn nav-prev" aria-label="Anterior">{"<"}</button>
                <button className="nav-btn nav-next" aria-label="Siguiente">{">"}</button>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
