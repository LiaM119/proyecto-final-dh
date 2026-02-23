import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/WhatsAppChatButton.css";

const DEFAULT_PHONE = "+5491128894638";
const DEFAULT_MESSAGE_PREFIX = "Hola! Tenia una consulta sobre";
const DEFAULT_PROMPT_TEXT = "Sobre que tenes la duda?";

function sanitizePhone(rawValue = "") {
  return String(rawValue).replace(/\D/g, "");
}

function normalizeMessage(rawValue = "") {
  const value = String(rawValue || "").trim();
  return value || DEFAULT_MESSAGE_PREFIX;
}

export default function WhatsAppChatButton() {
  const location = useLocation();
  const [notice, setNotice] = useState(null);

  const phone = useMemo(() => {
    const configuredPhone = import.meta.env.VITE_WHATSAPP_PHONE || DEFAULT_PHONE;
    return sanitizePhone(configuredPhone);
  }, []);

  const baseMessage = useMemo(() => {
    const configuredMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_MESSAGE_PREFIX;
    return normalizeMessage(configuredMessage);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const openWhatsApp = () => {
    if (!phone || phone.length < 10) {
      setNotice({
        type: "error",
        text: "No se pudo abrir WhatsApp: numero invalido.",
      });
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setNotice({
        type: "error",
        text: "Sin conexion. Revisa tu internet e intenta otra vez.",
      });
      return;
    }

    const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const topic = window.prompt(DEFAULT_PROMPT_TEXT, "");
    if (topic === null) return;

    const normalizedTopic = topic.trim();
    if (!normalizedTopic) {
      setNotice({
        type: "error",
        text: "Escribi tu duda para iniciar el chat.",
      });
      return;
    }

    const message = `${baseMessage} ${normalizedTopic}.\n\nPagina: ${currentUrl}`;
    const chatUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    try {
      const popup = window.open(chatUrl, "_blank", "noopener,noreferrer");

      if (!popup) {
        window.location.assign(chatUrl);
      }

      setNotice({
        type: "success",
        text: "WhatsApp abierto. Envia el mensaje para iniciar el chat.",
      });
    } catch {
      setNotice({
        type: "error",
        text: "No se pudo abrir WhatsApp. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="wa-chat">
      {notice && (
        <p
          className={`wa-chat__notice wa-chat__notice--${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {notice.text}
        </p>
      )}

      <button
        type="button"
        className="wa-chat__button"
        onClick={openWhatsApp}
        aria-label="Iniciar chat por WhatsApp"
      >
        <span className="wa-chat__icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" focusable="false">
            <path
              d="M16 3C8.82 3 3 8.82 3 16c0 2.25.58 4.46 1.69 6.41L3 29l6.78-1.77A12.92 12.92 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.73c-1.93 0-3.82-.51-5.47-1.48l-.39-.23-3.79.99 1-3.7-.24-.38A10.68 10.68 0 0 1 5.27 16c0-5.92 4.81-10.73 10.73-10.73S26.73 10.08 26.73 16 21.92 26.73 16 26.73zm5.88-8.06c-.32-.16-1.91-.94-2.2-1.04-.29-.11-.51-.16-.73.16-.21.32-.84 1.04-1.03 1.25-.19.21-.38.24-.69.08-.32-.16-1.35-.5-2.56-1.57-.95-.83-1.59-1.87-1.78-2.18-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.31.32-.53.1-.21.05-.39-.03-.55-.08-.15-.73-1.77-1-2.43-.26-.64-.54-.55-.74-.56h-.63c-.21 0-.55.08-.84.4-.29.32-1.11 1.08-1.11 2.63 0 1.56 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.43 4.79.75.32 1.35.52 1.8.66.77.25 1.46.22 2 .14.62-.1 1.91-.78 2.18-1.54.27-.75.27-1.4.19-1.53-.08-.1-.29-.18-.61-.34z"
              fill="currentColor"
            />
          </svg>
        </span>

        <span className="wa-chat__text">WhatsApp</span>
      </button>
    </div>
  );
}
