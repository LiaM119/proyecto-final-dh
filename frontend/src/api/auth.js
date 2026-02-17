// src/api/auth.js
import { http, AUTH_TOKEN_KEY } from "./http";

export const authApi = {
  login: async (email, password) => {
    const data = await http.postJson("/auth/login", { email, password });

    if (data?.token) localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    return data;
  },

  register: async (payload) => {
    const data = await http.postJson("/auth/register", payload);

    if (data?.token) localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};
