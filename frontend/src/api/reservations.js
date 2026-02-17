// src/api/reservations.js
import { http } from "./http";

export const reservationsApi = {
  getReservable: (id) => http.get(`/reservables/${id}`),

  getAvailability: (id, from, to) =>
    http.get(`/reservables/${id}/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  createReservation: (payload) => http.postJson(`/reservations`, payload),
};
