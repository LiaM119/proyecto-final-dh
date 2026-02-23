import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";

import AuthProvider from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";

import Header from "./components/Header.jsx";
import WhatsAppChatButton from "./components/WhatsAppChatButton.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Home from "./components/Home.jsx";
import Productos from "./components/Productos.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Contacto from "./pages/Contacto.jsx";

import Favoritos from "./components/Favoritos.jsx";
import MyReservationHistory from "./pages/MyReservationHistory.jsx";

import AdminPanel from "./pages/admin/AdminPanel.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminProductsList from "./pages/admin/AdminProductsList.jsx";
import AddProduct from "./pages/admin/AddProduct.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminReservations from "./pages/admin/AdminReservations.jsx";

import Reservas from "./pages/Reservas.jsx";

import { productsApi } from "./api/products.js";
import "./index.css";

function Layout() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/administracion") || location.pathname.startsWith("/admin");

  return (
    <>
      <Header />
      <div className="hdr-spacer" />
      <Outlet />
      {!isAdminRoute && <WhatsAppChatButton />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="admin" element={<Navigate to="/administracion" replace />} />
              <Route path="admin/*" element={<Navigate to="/administracion" replace />} />

              <Route index element={<Home />} />
              <Route path="alojamientos" element={<Productos />} />
              <Route path="productos" element={<Productos />} />
              <Route
                path="alojamientos/:id"
                element={<ProductDetail fetchById={productsApi.getById} />}
              />
              <Route
                path="productos/:id"
                element={<ProductDetail fetchById={productsApi.getById} />}
              />

              <Route
                path="reservas"
                element={
                  <ProtectedRoute>
                    <Reservas />
                  </ProtectedRoute>
                }
              />

              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="contacto" element={<Contacto />} />

              <Route
                path="favoritos"
                element={
                  <ProtectedRoute>
                    <Favoritos />
                  </ProtectedRoute>
                }
              />

              <Route
                path="mis-reservas"
                element={
                  <ProtectedRoute>
                    <MyReservationHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="administracion"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="alojamientos" element={<AdminProductsList />} />
                <Route path="alojamientos/nuevo" element={<AddProduct />} />
                <Route path="alojamientos/editar/:id" element={<AddProduct />} />
                <Route path="productos" element={<AdminProductsList />} />
                <Route path="productos/nuevo" element={<AddProduct />} />
                <Route path="productos/editar/:id" element={<AddProduct />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="tipos-alojamiento" element={<AdminCategories />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="reservas" element={<AdminReservations />} />
              </Route>

              <Route path="*" element={<div style={{ padding: 24 }}>Página no encontrada</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>
);


