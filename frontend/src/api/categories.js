// src/api/categories.js
import { http } from "./http";

export const categoriesApi = {
  getAll: () => http.get("/api/categories"),
  create: (payload) => http.postJson("/api/categories", payload),
  update: (id, payload) => http.putJson(`/api/categories/${id}`, payload),


  remove: (id, { force = false } = {}) =>
    http.del(`/api/categories/${id}?force=${force}`),

  productCount: (id) =>
    http.get(`/api/categories/${id}/product-count`),
};
