import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/ShareModal.css";

const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";

function toAbsoluteUrl(u = "") {
  if (!u) return "";
  const s = String(u).replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  if (s.startsWith("/uploads/")) return API_BASE + s;
  if (s.startsWith("uploads/")) return API_BASE + "/" + s;
  if (s.startsWith("/")) return (import.meta.env.VITE_SITE_URL || window.location.origin) + s;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
}

function resolveProductImage(product) {
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

  let raw = candidates.find((value) => value != null);

  if (typeof raw === "string") raw = [raw];

  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    raw = [raw.url || raw.path || raw.src || raw.imageUrl || raw.image || raw.fileName || ""];
  }

  const first = (Array.isArray(raw) ? raw : [])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.url || item.path || item.src || item.imageUrl || item.image || item.fileName || "";
      }
      return "";
    })
    .map(toAbsoluteUrl)
    .find(Boolean);

  return first || "";
}

function buildShareUrl({ network, url, message }) {
  const U = encodeURIComponent(url);
  const txt = message?.trim() ? `${message.trim()}\n${url}` : url;

  switch (network) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${U}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${U}${
        message?.trim() ? `&text=${encodeURIComponent(message.trim())}` : ""
      }`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(txt)}`;
    case "telegram":
      return `https://t.me/share/url?url=${U}${
        message?.trim() ? `&text=${encodeURIComponent(message.trim())}` : ""
      }`;
    case "email": {
      const body = message?.trim() ? `${message.trim()}\n\n${url}` : url;
      return `mailto:?subject=${encodeURIComponent("Mira este alojamiento")}&body=${encodeURIComponent(body)}`;
    }
    default:
      return url;
  }
}

export default function ShareProductModal({ open, onClose, product }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setMessage("");
  }, [open]);

  const shareUrl = useMemo(() => {
    const base = import.meta.env.VITE_SITE_URL || window.location.origin;
    return product?.id ? `${base}/alojamientos/${product.id}` : base;
  }, [product?.id]);

  const title = product?.name || product?.title || product?.nombre || "Alojamiento";
  const description = product?.description || product?.descripcion || product?.shortDescription || "";

  const imageUrl = useMemo(() => resolveProductImage(product), [product]);

  const shareMessage = useMemo(() => {
    if (message?.trim()) return message.trim();
    return `Mira este alojamiento: ${title}`;
  }, [message, title]);

  if (!open || typeof document === "undefined") return null;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function openShare(network) {
    const link = buildShareUrl({ network, url: shareUrl, message: shareMessage });
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const modal = (
    <div className="spm-backdrop" onMouseDown={onClose}>
      <div className="spm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="spm-head">
          <div>
            <h3 className="spm-title">Compartir alojamiento</h3>
            <p className="spm-sub">Se comparte el link del alojamiento (podes agregar un mensaje).</p>
          </div>
          <button className="spm-close" onClick={onClose} aria-label="Cerrar">
            x
          </button>
        </div>

        <div className="spm-body">
          <div className="spm-preview">
            <div className="spm-thumb">
              {imageUrl ? <img src={imageUrl} alt={title} /> : <div className="spm-thumb-placeholder">Sin imagen</div>}
            </div>

            <div className="spm-info">
              <div className="spm-product-title">{title}</div>
              <div className="spm-product-desc">{description}</div>
              <div className="spm-url">{shareUrl}</div>
            </div>
          </div>

          <label className="spm-label">
            Mensaje (opcional)
            <textarea
              className="spm-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Che, mira esto..."
              rows={3}
            />
          </label>

          <div className="spm-actions">
            <button className="spm-btn" onClick={() => openShare("facebook")}>
              Facebook
            </button>
            <button className="spm-btn" onClick={() => openShare("twitter")}>
              X
            </button>
            <button className="spm-btn" onClick={() => openShare("whatsapp")}>
              WhatsApp
            </button>
            <button className="spm-btn" onClick={() => openShare("telegram")}>
              Telegram
            </button>
            <button className="spm-btn" onClick={() => openShare("email")}>
              Email
            </button>
          </div>

          <div className="spm-footer">
            <button className="spm-btn-secondary" onClick={onCopy}>
              {copied ? "Link copiado" : "Copiar link"}
            </button>
            <button className="spm-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
