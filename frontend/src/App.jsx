import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Productos from "./components/Productos.jsx";
import AddProduct from "./pages/admin/AddProduct.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import { productsApi } from "./api/products";
import Footer from "./components/Footer";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminProductsList from "./pages/admin/AdminProductsList";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route
            path="/productos/:id"
            element={<ProductDetail fetchById={(id) => productsApi.getById(id)} />}
          />
          <Route path="/admin/productos/nuevo" element={<AddProduct />} />

          <Route path="/administracion" element={<AdminPanel />} />
          <Route path="/administracion/productos" element={<AdminProductsList />} />

          <Route
            path="*"
            element={<div style={{ padding: 24 }}>404 - No encontrado</div>}
          />
        </Routes>
        <Footer />
      </main>
    </>
  );
}
