// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Catalogo from "./pages/Catalogo";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import HistorialPedidos from "./pages/HistorialPedidos";
import AdminProductos from "./pages/AdminProductos";
import AdminPedidos from "./pages/AdminPedidos";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/historial-pedidos" element={<HistorialPedidos />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
