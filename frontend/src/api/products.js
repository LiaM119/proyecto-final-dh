const BASE = import.meta.env.VITE_API || "http://localhost:8080";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status}. ${body.slice(0, 180)}`);
  }
  return res.json();
}

async function sendJson(url, { method = "POST", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status}. ${txt.slice(0, 180)}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const productsApi = {
  // ---------------- PRODUCTS ----------------
  getAll() {
    return getJson(`${BASE}/api/products`);
  },
  getById(id) {
    return getJson(`${BASE}/api/products/${id}`);
  },
  async createMultipart({ name, description, price, stock, categoryId, files }) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description ?? "");
    fd.append("price", price);
    fd.append("stock", stock);
    if (categoryId != null) fd.append("categoryId", String(categoryId));
    (files || []).forEach((f) => fd.append("images", f));

    const res = await fetch(`${BASE}/api/products`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async updateMultipart(id, { name, description, price, stock, categoryId, files }) {
    const fd = new FormData();
    if (name != null) fd.append("name", name);
    if (description != null) fd.append("description", description);
    if (price != null) fd.append("price", price);
    if (stock != null) fd.append("stock", stock);
    if (categoryId != null) fd.append("categoryId", String(categoryId));
    (files || []).forEach((f) => fd.append("images", f));

    const res = await fetch(`${BASE}/api/products/${id}`, { method: "PUT", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`${BASE}/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },

  // ---------------- CATEGORIES (para el dropdown) ----------------
  getCategories() {
    return getJson(`${BASE}/api/categories`);
  },

  createCategory(dto) {
    return sendJson(`${BASE}/api/categories`, { method: "POST", body: dto });
  },
  updateCategory(id, dto) {
    return sendJson(`${BASE}/api/categories/${id}`, { method: "PUT", body: dto });
  },
  removeCategory(id) {
    return sendJson(`${BASE}/api/categories/${id}`, { method: "DELETE" });
  },
};
