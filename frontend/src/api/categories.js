// src/api/categories.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const authHeaders = () => {
  const token = localStorage.getItem("turmalin:token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const categoriesApi = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error al cargar categorías (${res.status})`);
    }

    return res.json();
  },

  create: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = `Error al crear categoría (${res.status})`;
      try {
        const data = await res.json();
        if (data && data.message) msg = data.message;
      } catch {
        // ignoramos si no hay JSON
      }
      throw new Error(msg);
    }

    return res.json();
  },
};
