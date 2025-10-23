import { useState, useEffect, useCallback } from "react";
import "../styles/ImageCarousel.css";

export default function ImageCarousel({ images = [] }) {
  const [idx, setIdx] = useState(0);
  const hasMany = images.length > 1;

  const prev = useCallback(
    (e) => {
      e.stopPropagation(); // evita abrir detalle
      setIdx((i) => (i - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const next = useCallback(
    (e) => {
      e.stopPropagation(); // evita abrir detalle
      setIdx((i) => (i + 1) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    setIdx(0);
  }, [images]);

  useEffect(() => {
    function onKey(e) {
      if (!hasMany) return;
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMany, images.length]);

  if (!images.length) return <div className="ic-empty">Sin imágenes</div>;

  return (
    <div className="ic-wrap" onClick={(e) => e.stopPropagation()}>
      <div className="ic-view">
        {hasMany && (
          <button
            className="ic-btn ic-left"
            onClick={prev}
            aria-label="Anterior"
          >
            ‹
          </button>
        )}

        <img src={images[idx]} alt={`img-${idx}`} className="ic-main" />

        {hasMany && (
          <button
            className="ic-btn ic-right"
            onClick={next}
            aria-label="Siguiente"
          >
            ›
          </button>
        )}
      </div>

      {hasMany && (
        <div className="ic-thumbs">
          {images.map((u, i) => (
            <button
              key={u + 1}
              className={`ic-thumb ${i === idx ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation(); // evita abrir detalle
                setIdx(i);
              }}
            >
              <img src={u} alt={`thumb-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
