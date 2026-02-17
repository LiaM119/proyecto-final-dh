const API = import.meta.env.VITE_API_URL;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = data?.message || "Error inesperado";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  getReservable: (id) => apiFetch(`/reservables/${id}`),

  getAvailability: (id, from, to) =>
    apiFetch(`/reservables/${id}/availability?from=${from}&to=${to}`),

  createReservation: (payload) =>
    apiFetch(`/reservations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
