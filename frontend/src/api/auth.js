// src/api/auth.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let msg = `Error HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.message) msg = data.message;
      } catch {
      }
      throw new Error(msg);
    }

    return res.json();
  },

  register: async (payload) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = `Error HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.message) msg = data.message;
      } catch {}
      throw new Error(msg);
    }

    return res.json();
  },
};
