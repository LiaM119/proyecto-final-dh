import "../styles/Home.css";
import {
  ShoppingBag, Zap, Shield, Settings, ChevronDown
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

export default function Home() {

  // ---- Animación "WHY" ----
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

  // ---- Scroll suave hacia la siguiente sección ----
  const scrollToWhy = () => {
    const nextSection = document.querySelector(".why");
    if (!nextSection) return;

    const start = window.scrollY;
    const end = nextSection.getBoundingClientRect().top + window.scrollY;
    const distance = end - start;
    const duration = 1000; // 1 segundo
    let startTime = null;

    function smoothStep(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2; // easing cúbico
    }

    function animateScroll(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = smoothStep(progress);

      window.scrollTo(0, start + distance * ease);

      if (elapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  };

  // ---- Productos ----
  const [raw, setRaw] = useState([]);
  const products = useMemo(() => (Array.isArray(raw) ? raw : []), [raw]);

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
        if (!list.length) throw new Error("No hay productos");
        const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
        setRaw(shuffled);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setRaw([
          { id: "ph1", name: "Producto demo 1", price: 0, imageUrls:["/placeholder.jpg"] },
          { id: "ph2", name: "Producto demo 2", price: 0, imageUrls:["/placeholder.jpg"] },
          { id: "ph3", name: "Producto demo 3", price: 0, imageUrls:["/placeholder.jpg"] },
        ]);
      }
    })();
  }, []);

  const getImg = (p) => {
    if (p?.imageUrls?.length > 0) {
      const url = p.imageUrls[0];
      return url.startsWith("http")
        ? url
        : `http://localhost:8080${url}`;
    }
    return "https://via.placeholder.com/600x400?text=Turmalin";
  };

  return (
    <>
      {/* HERO */}
      <section className="home">
        <div className="container">
          <h1>Bienvenido a Turmalin</h1>
          <p>Servicio técnico de PC</p>
        </div>
        <div
          className="scroll-arrow"
          onClick={scrollToWhy}
          aria-label="Bajar"
        >
          <ChevronDown size={42} />
        </div>
      </section>

      {/* WHY */}
      <section className="why">
        <h2>¿Por qué elegir Turmalin?</h2>
        <p>Ofrecemos las mejores herramientas para gestionar tus productos y reservas</p>

        <div className="why-grid">
          <div className="why-card">
            <ShoppingBag size={36} />
            <h3>Catálogo Completo</h3>
            <p>Explora una amplia variedad de productos disponibles para reservar</p>
          </div>
          <div className="why-card">
            <Zap size={36} />
            <h3>Reservas Rápidas</h3>
            <p>Sistema de reservas instantáneo y fácil de usar</p>
          </div>
          <div className="why-card">
            <Shield size={36} />
            <h3>Seguro y Confiable</h3>
            <p>Tus datos y reservas están protegidos con la mejor seguridad</p>
          </div>
          <div className="why-card">
            <Settings size={36} />
            <h3>Gestión Fácil</h3>
            <p>Panel de administración intuitivo para gestionar productos</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="home-products" id="home-products">
        <h2 className="home-products-title">¿Qué productos puedo encontrar en Turmalin?</h2>

        {products.length === 0 ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="swiper-wrap">
            <Swiper
              modules={[Navigation, EffectCoverflow]}
              effect="coverflow"
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1.05,
                slideShadows: false,
              }}
              centeredSlides
              slidesPerView={"auto"}
              spaceBetween={16}
              loop
              navigation={{ nextEl: ".nav-next", prevEl: ".nav-prev" }}
              grabCursor
              className="turmalin-swiper"
              breakpoints={{
                0: { spaceBetween: 12 },
                768: { spaceBetween: 16 },
              }}
            >
              {(products ?? []).map((p) => (
                <SwiperSlide key={p?.id ?? p?.name} className="ts-slide">
                  <article className="ts-card">
                    <div className="ts-img">
                      <img src={getImg(p)} alt={p?.name || "Producto"} />
                    </div>
                    <div className="ts-info">
                      <h3 title={p?.name}>{p?.name ?? "Producto"}</h3>
                      {p?.price != null && <p className="price">${p.price}</p>}
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="nav-btn nav-prev" aria-label="Anterior">‹</button>
            <button className="nav-btn nav-next" aria-label="Siguiente">›</button>
          </div>
        )}
      </section>
    </>
  );
}
