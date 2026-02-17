import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";

export default function FavoriteButton({ productId }) {
  const { has, toggle, isLogged } = useFavorites();
  const fav = has(productId);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLogged) {
      alert("Tenés que iniciar sesión para marcar favoritos.");
      return;
    }

    try {
      await toggle(productId);
    } catch {
      alert("No se pudo actualizar el favorito. Reintentá.");
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label={fav ? "Quitar de favoritos" : "Marcar como favorito"}
      title={fav ? "Quitar de favoritos" : "Marcar como favorito"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.25)",
        background: "rgba(0,0,0,.35)",
        cursor: "pointer",
      }}
    >
      <Heart
        size={18}
        style={{
          fill: fav ? "currentColor" : "transparent",
        }}
      />
    </button>
  );
}
