// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Productos from "./components/Productos.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import Footer from "./components/Footer";

import AdminPanel from "./pages/admin/AdminPanel";
import AdminProductsList from "./pages/admin/AdminProductsList";
import AddProduct from "./pages/admin/AddProduct.jsx";

import { productsApi } from "./api/products";

import Register from "./pages/Register";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route
            path="/productos/:id"
            element={<ProductDetail fetchById={(id) => productsApi.getById(id)} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Privadas (requieren sesión) */}
          <Route element={<PrivateRoute />}>
            {/* Admin root */}
            <Route path="/administracion" element={<AdminPanel />} />

            {/* Listado de productos en admin (dos aliases) */}
            <Route path="/administracion/productos" element={<AdminProductsList />} />
            <Route path="/admin/productos" element={<AdminProductsList />} />

            {/* Crear / Editar usan el mismo form */}
            <Route path="/admin/productos/nuevo" element={<AddProduct />} />
            <Route path="/admin/productos/editar/:id" element={<AddProduct />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 24 }}>404 - No encontrado</div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
