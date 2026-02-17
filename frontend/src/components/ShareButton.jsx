import { useState } from "react";
import ShareProductModal from "./ShareProductModal";

export default function ShareButton({ product, className = "", label = "Compartir" }) {
  const [open, setOpen] = useState(false);

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <button className={`share-btn ${className}`} onClick={onClick} type="button">
        {label}
      </button>

      <ShareProductModal open={open} onClose={() => setOpen(false)} product={product} />
    </>
  );
}
