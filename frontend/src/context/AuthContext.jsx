// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function userIsAdmin(appUser) {
  if (!appUser) return false;
  if (appUser.admin === true) return true;

  const role = String(appUser.role || "").toUpperCase();
  return role === "ADMIN" || role === "ROLE_ADMIN";
}

function normalizeUser(appUser) {
  if (!appUser) return null;
  return { ...appUser, admin: userIsAdmin(appUser) };
}

export default function AuthProvider({ children }) {
  // ==================== ESTADOS ====================
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("turmalin:user");
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      localStorage.removeItem("turmalin:user");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("turmalin:token") || "";
  });

  // ==================== SYNC LOCALSTORAGE ====================
  useEffect(() => {
    if (user) localStorage.setItem("turmalin:user", JSON.stringify(user));
    else localStorage.removeItem("turmalin:user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("turmalin:token", token);
    else localStorage.removeItem("turmalin:token");
  }, [token]);

  // ==================== LOGIN ====================
  const login = async (email, password) => {
    const data = await authApi.login(email, password);

    const appUser = normalizeUser(data.user);

    setUser(appUser);
    setToken(data.token);

    return appUser;
  };

  // ==================== LOGOUT ====================
  const logout = () => {
    setUser(null);
    setToken("");
  };

  // ==================== VALUE DEL CONTEXTO ====================
  const value = {
    user,
    token,
    login,
    logout,
    setUser: (nextUser) => setUser(normalizeUser(nextUser)),
    isLogged: !!user && !!token,
    isAdmin: userIsAdmin(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
