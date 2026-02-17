// src/api/favorites.js
import { http, AUTH_TOKEN_KEY } from "./http";

const LS_KEY = "turmalin:favorites:ids";

function isLogged() {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

function toNumberArray(value) {
  if (Array.isArray(value)) return value.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (value && Array.isArray(value.ids)) return value.ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  return [];
}

function readLocalIds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return toNumberArray(parsed);
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(toNumberArray(ids)));
  } catch {

  }
}

export async function getFavoriteIds() {
  if (!isLogged()) return [];

  try {
    const res = await http.get("/api/favorites/ids");
    const ids = toNumberArray(res);
    writeLocalIds(ids);
    return ids;
  } catch {
    return readLocalIds();
  }
}


export async function addFavorite(productId) {
  const id = Number(productId);


  const current = new Set(readLocalIds());
  current.add(id);
  writeLocalIds([...current]);

  if (!isLogged()) return [...current];

  try {
    const res = await http.postJson(`/api/favorites/${id}`, {});
    const ids = toNumberArray(res);
    writeLocalIds(ids);
    return ids;
  } catch {

    return [...current];
  }
}

export async function removeFavorite(productId) {
  const id = Number(productId);

  const current = new Set(readLocalIds());
  current.delete(id);
  writeLocalIds([...current]);

  if (!isLogged()) return [...current];

  try {
    const res = await http.del(`/api/favorites/${id}`);
    const ids = toNumberArray(res);
    writeLocalIds(ids);
    return ids;
  } catch {

    return [...current];
  }
}

export function clearFavoritesCache() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {

  }
}
