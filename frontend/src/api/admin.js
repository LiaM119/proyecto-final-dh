// src/api/admin.js
import { http } from "./http";

export const adminApi = {
  getUsers: () => http.get("/admin/users"),

  setAdmin: (userId, admin) => http.patchJson(`/admin/users/${userId}/admin`, { admin }),
};
