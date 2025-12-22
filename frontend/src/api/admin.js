// src/api/admin.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const authHeaders = () => {
  const token = localStorage.getItem("turmalin:token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const adminApi = {
  // GET /admin/users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error al cargar usuarios (${res.status})`);
    }

    return res.json(); 
  },

  // PATCH /admin/users/:id/admin { admin: true/false }
  setAdmin: async (userId, admin) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/admin`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ admin }),
    });

    if (!res.ok) {
      throw new Error(`Error al actualizar permisos (${res.status})`);
    }

    return res.json(); 
  },
};
