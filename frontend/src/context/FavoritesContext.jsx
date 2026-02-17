import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { addFavorite, getFavoriteIds, removeFavorite } from "../api/favorites";
import { AUTH_TOKEN_KEY } from "../api/http";

const FavoritesContext = createContext(null);

const FAVORITES_EVENT = "turmalin:favorites:changed";

export function emitFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const isLogged = !!localStorage.getItem(AUTH_TOKEN_KEY);

  const refresh = useCallback(async () => {
    if (!isLogged) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ids = await getFavoriteIds(); 
      setFavoriteIds(new Set(ids || []));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isLogged]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await refresh();
    })();

    return () => {
      alive = false;
    };
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => refresh();
    window.addEventListener(FAVORITES_EVENT, onChanged);
    return () => window.removeEventListener(FAVORITES_EVENT, onChanged);
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key.toLowerCase().includes("favorite")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const api = useMemo(() => {
    const has = (id) => favoriteIds.has(Number(id));

    const toggle = async (productId) => {
      const id = Number(productId);

      const prev = new Set(favoriteIds);
      const next = new Set(favoriteIds);
      const currentlyFav = next.has(id);

      if (currentlyFav) next.delete(id);
      else next.add(id);

      setFavoriteIds(next);

      try {
        const updatedIds = currentlyFav
          ? await removeFavorite(id)
          : await addFavorite(id);

        setFavoriteIds(new Set(updatedIds || []));

        emitFavoritesChanged();
      } catch (e) {
        setFavoriteIds(prev);
        throw e;
      }
    };

    return {
      favoriteIds,
      has,
      toggle,
      loading,
      isLogged,
      refresh, 
    };
  }, [favoriteIds, loading, isLogged, refresh]);

  return (
    <FavoritesContext.Provider value={api}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
