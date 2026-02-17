import { useEffect, useMemo, useState } from "react";
import "../styles/shareModal.css";

const API_BASE = import.meta.env.VITE_API || "http://localhost:8080";

function toAbsoluteUrl(u = "") {
  if (!u) return "";
  const s = String(u).replace(/\\/g, "/");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return API_BASE + s;
  if (s.startsWith("uploads/")) return API_BASE + "/" + s;
  if (s.startsWith("/")) return (import.meta.env.VITE_SITE_URL || window.location.origin) + s;
  return s;
}

/** ✅ Genera el link de compartir por red, SIEMPRE incluyendo URL */
function buildShareUrl({ network, url, message }) {
  const U = encodeURIComponent(url);

  // Si hay mensaje, lo ponemos arriba y el link abajo (para que WhatsApp lo detecte sí o sí)
  const txt = message?.trim() ? `${message.trim()}\n${url}` : url;

  switch (network) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${U}`;

    case "twitter":
      // en X dejamos el link SIEMPRE (y texto opcional)
      return `https://twitter.com/intent/tweet?url=${U}${
        message?.trim() ? `&text=${encodeURIComponent(message.trim())}` : ""
      }`;

    case "whatsapp":
      // ✅ WhatsApp: si o si el link
      return `https://wa.me/?text=${encodeURIComponent(txt)}`;

    case "telegram":
      // ✅ Telegram: url + texto opcional
      return `https://t.me/share/url?url=${U}${
        message?.trim() ? `&text=${encodeURIComponent(message.trim())}` : ""
      }`;

    case "email": {
      const body = message?.trim() ? `${message.trim()}\n\n${url}` : url;
      return `mailto:?subject=${encodeURIComponent("Mirá este producto")}&body=${encodeURIComponent(body)}`;
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
    return () => (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setMessage("");
  }, [open]);

  const shareUrl = useMemo(() => {
    const base = import.meta.env.VITE_SITE_URL || window.location.origin;
    return product?.id ? `${base}/productos/${product.id}` : base;
  }, [product?.id]);

  const title = product?.name || product?.title || product?.nombre || "Producto";
  const description =
    product?.description ||
    product?.descripcion ||
    product?.shortDescription ||
    "";

  const imageUrl = useMemo(() => {
    const first =
      (Array.isArray(product?.images) && product.images[0]) ||
      product?.imageUrl ||
      product?.image ||
      "";
    return toAbsoluteUrl(first);
  }, [product]);

  const shareMessage = useMemo(() => {
    if (message?.trim()) return message.trim();

    return `Mirá este producto: ${title}`;
  }, [message, title]);

  if (!open) return null;

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

  return (
    <div className="spm-backdrop" onMouseDown={onClose}>
      <div className="spm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="spm-head">
          <div>
            <h3 className="spm-title">Compartir producto</h3>
            <p className="spm-sub">Se comparte el link del producto (podés agregar un mensaje).</p>
          </div>
          <button className="spm-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="spm-body">
          <div className="spm-preview">
            <div className="spm-thumb">
              {imageUrl ? (
                <img src={imageUrl} alt={title} />
              ) : (
                <div className="spm-thumb-placeholder">Sin imagen</div>
              )}
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
              placeholder="Ej: Che, mirá esto..."
              rows={3}
            />
          </label>

          <div className="spm-actions">
            <button className="spm-btn" onClick={() => openShare("facebook")}>Facebook</button>
            <button className="spm-btn" onClick={() => openShare("twitter")}>X</button>
            <button className="spm-btn" onClick={() => openShare("whatsapp")}>WhatsApp</button>
            <button className="spm-btn" onClick={() => openShare("telegram")}>Telegram</button>
            <button className="spm-btn" onClick={() => openShare("email")}>Email</button>
          </div>

          <div className="spm-footer">
            <button className="spm-btn-secondary" onClick={onCopy}>
              {copied ? "✅ Link copiado" : "Copiar link"}
            </button>
            <button className="spm-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
