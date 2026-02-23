// src/App.jsx
import "./styles/reservas.css";

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

import ReservationCheckout from "./pages/ReservationCheckout";
import MyReservationHistory from "./pages/MyReservationHistory";

import Favoritos from "./pages/Favoritos";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alojamientos" element={<Productos />} />
          <Route path="/productos" element={<Productos />} />
          <Route
            path="/alojamientos/:id"
            element={<ProductDetail fetchById={(id) => productsApi.getById(id)} />}
          />
          <Route
            path="/productos/:id"
            element={<ProductDetail fetchById={(id) => productsApi.getById(id)} />}
          />

          <Route path="/reservas" element={<ReservationCheckout />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/mis-reservas" element={<MyReservationHistory />} />

            {/* Admin root */}
            <Route path="/administracion" element={<AdminPanel />} />

            <Route path="/administracion/alojamientos" element={<AdminProductsList />} />
            <Route path="/administracion/productos" element={<AdminProductsList />} />
            <Route path="/admin/alojamientos" element={<AdminProductsList />} />
            <Route path="/admin/productos" element={<AdminProductsList />} />

            <Route path="/admin/alojamientos/nuevo" element={<AddProduct />} />
            <Route path="/admin/productos/nuevo" element={<AddProduct />} />
            <Route path="/admin/alojamientos/editar/:id" element={<AddProduct />} />
            <Route path="/admin/productos/editar/:id" element={<AddProduct />} />
            <Route path="/admin/add-product" element={<AddProduct />} />

          </Route>

          <Route path="*" element={<div style={{ padding: 24 }}>404 - No encontrado</div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

