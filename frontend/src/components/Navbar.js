// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let rol = null;
  if (token) {
    try {
      rol = jwtDecode(token).rol;
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Título */}
        <Link to="/" className="text-white text-2xl font-bold">
          SublidathaApp
        </Link>

        {/* Botón hamburguesa - solo en móviles */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Enlaces principales */}
        <div
          className={`flex-1 md:flex md:items-center md:justify-end ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <Link
            to="/catalogo"
            className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
            onClick={() => setMenuOpen(false)}
          >
            Catálogo
          </Link>

          {/* Solo administradores */}
          {rol === "administrador" && (
            <>
              <Link
                to="/admin/productos"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Admin Productos
              </Link>
              <Link
                to="/admin/pedidos"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Admin Pedidos
              </Link>
            </>
          )}

          {/* Enlaces de usuario autenticado o invitado */}
          {token ? (
            <>
              <Link
                to="/perfil"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Perfil
              </Link>
              <Link
                to="/historial-pedidos"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Mis Pedidos
              </Link>

              <Link
                to="/carrito"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                <FiShoppingCart className="w-6 h-6" />
              </Link>

              <button
                onClick={handleLogout}
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 border border-white px-3 py-1 rounded text-white hover:bg-white hover:text-blue-600 transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/registro"
                className="block md:inline-block mt-2 md:mt-0 md:ml-6 text-white hover:text-blue-200 transition"
                onClick={() => setMenuOpen(false)}
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
