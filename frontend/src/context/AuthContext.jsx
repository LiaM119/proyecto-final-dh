// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  // ==================== ESTADOS ====================
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("turmalin:user");
    return raw ? JSON.parse(raw) : null;
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

    const appUser = data.user;

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
    setUser,              
    isLogged: !!user,
    isAdmin: user?.admin === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
