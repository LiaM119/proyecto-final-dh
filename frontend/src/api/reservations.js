// src/api/reservations.js
import { http } from "./http";

export const reservationsApi = {
  getReservable: (id) => http.get(`/api/reservables/${id}`),
  getAvailability: (id, from, to) =>
    http.get(
      `/api/reservables/${id}/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),

  getByReservable: (reservableId) =>
    http.get(`/api/reservations/reservable/${reservableId}`),

  getMyHistory: () => http.get("/api/reservations/me"),

  findAvailable: (from, to) =>
    http.get(
      `/api/reservations/available?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),

  createReservation: (payload) => http.postJson(`/api/reservations`, payload),
};
