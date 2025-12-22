// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import AuthProvider from "./context/AuthContext.jsx";
import Header from "./components/Header.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

// -------- PÚBLICAS --------
import Home from "./components/Home.jsx";
import Productos from "./components/Productos.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// -------- ADMIN --------
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminProductsList from "./pages/admin/AdminProductsList.jsx";
import AddProduct from "./pages/admin/AddProduct.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

import { productsApi } from "./api/products.js";
import "./index.css";

function Layout() {
  return (
    <>
      <Header />
      <div className="hdr-spacer" />
      <Outlet />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA RAÍZ CON LAYOUT */}
          <Route path="/" element={<Layout />}>
            {/* ======== PÚBLICAS ======== */}
            <Route index element={<Home />} />
            <Route path="productos" element={<Productos />} />
            <Route
              path="productos/:id"
              element={<ProductDetail fetchById={productsApi.getById} />}
            />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />

            {/* ======== ADMIN (PROTEGIDA) ======== */}
            <Route
              path="administracion"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<AdminProductsList />} />
              <Route path="productos/nuevo" element={<AddProduct />} />
              <Route path="productos/editar/:id" element={<AddProduct />} />
              <Route path="usuarios" element={<AdminUsers />} />
            </Route>

            {/* ======== 404 ======== */}
            <Route
              path="*"
              element={<div style={{ padding: 24 }}>Página no encontrada</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
