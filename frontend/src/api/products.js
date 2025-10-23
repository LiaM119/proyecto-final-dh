// src/api/products.js
const BASE = import.meta.env.VITE_API || "http://localhost:8080";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status}. ${body.slice(0, 180)}`);
  }
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> content-type=${ct}. ${body.slice(0, 180)}`);
  }
  return res.json();
}

export const productsApi = {
  getAll() {
    return getJson(`${BASE}/api/products`);
  },
  getById(id) {
    return getJson(`${BASE}/api/products/${id}`);
  },
  async remove(id) {
    const r = await fetch(`${BASE}/api/products/${id}`, { method: "DELETE" });
    if (!r.ok) throw new Error("Error eliminando producto");
    return true;
  },
  // (opcional) create: tu backend espera multipart/form-data, así que no lo toco aquí
};
