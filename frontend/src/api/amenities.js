import { http } from "./http";

export const amenitiesApi = {
  getAll: () => http.get("/api/amenities"),
  create: (payload) => http.postJson("/api/amenities", payload),
  update: (id, payload) => http.putJson(`/api/amenities/${id}`, payload),
  remove: (id) => http.del(`/api/amenities/${id}`),
};
