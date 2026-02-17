// src/api/products.js
import { http } from "./http";

export const productsApi = {
  getAll: () => http.get("/api/products"),
  getById: (id) => http.get(`/api/products/${id}`),

  createMultipart: async ({ name, description, price, stock, categoryId, files }) => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description ?? "");
    fd.append("price", String(price));
    fd.append("stock", String(stock));
    if (categoryId != null && categoryId !== "") fd.append("categoryId", String(categoryId));
    (files || []).forEach((f) => fd.append("images", f));

    return http.postForm("/api/products", fd);
  },

  updateMultipart: async (id, { name, description, price, stock, categoryId, files }) => {
    const fd = new FormData();
    if (name != null) fd.append("name", name);
    if (description != null) fd.append("description", description);
    if (price != null) fd.append("price", String(price));
    if (stock != null) fd.append("stock", String(stock));
    if (categoryId != null && categoryId !== "") fd.append("categoryId", String(categoryId));
    (files || []).forEach((f) => fd.append("images", f));

    return http.putForm(`/api/products/${id}`, fd);
  },

  remove: (id) => http.del(`/api/products/${id}`),

  getCategories: () => http.get("/api/categories"),
};
