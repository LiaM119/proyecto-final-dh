const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const usersApi = {
  getAll: async (token) => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    return res.json(); 
  },

  setAdmin: async (id, value, token) => {
    const res = await fetch(
      `${BASE_URL}/admin/users/${id}/admin?value=${value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    return res.json(); 
  },
};
