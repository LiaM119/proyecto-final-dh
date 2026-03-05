// src/api/favorites.js
import { http, AUTH_TOKEN_KEY } from "./http";

const LS_KEY = "turmalin:favorites:ids";

function isLogged() {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

function parseJwtPayload(token) {
  try {
    const [, payload = ""] = String(token).split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function getUserScope() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    const payload = parseJwtPayload(token);
    const uid = payload?.userId ?? payload?.uid ?? payload?.sub ?? null;
    if (uid != null && String(uid).trim() !== "") return `uid:${String(uid)}`;

    const mail = payload?.email ?? payload?.preferred_username ?? null;
    if (mail) return `mail:${String(mail).toLowerCase()}`;

    return `token:${token.slice(-16)}`;
  }

  try {
    const rawUser = localStorage.getItem("turmalin:user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.id != null) return `uid:${String(user.id)}`;
      if (user?.email) return `mail:${String(user.email).toLowerCase()}`;
    }
  } catch {
    void 0;
  }
  return "guest";
}

function scopedKey() {
  return `${LS_KEY}:${getUserScope()}`;
}

function toNumberArray(value) {
  if (Array.isArray(value)) return value.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (value && Array.isArray(value.ids)) return value.ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  return [];
}

function readLocalIds() {
  try {
    const rawScoped = localStorage.getItem(scopedKey());
    if (!rawScoped) return [];
    const parsedScoped = JSON.parse(rawScoped);
    return toNumberArray(parsedScoped);
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  try {
    localStorage.setItem(scopedKey(), JSON.stringify(toNumberArray(ids)));
    localStorage.removeItem(LS_KEY);
  } catch {
    return;
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
    localStorage.removeItem(scopedKey());
  } catch {
    return;
  }
}
