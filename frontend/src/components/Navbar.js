// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
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

  const styles = {
    container: {
      background: "#333",
      color: "#fff",
      padding: "10px 20px",
      display: "flex",
      justifyContent: "space-between",
    },
    navLinks: { display: "flex", gap: "1rem" },
    link: { color: "#fff", textDecoration: "none", fontWeight: "bold" },
    button: {
      background: "transparent",
      border: "1px solid #fff",
      color: "#fff",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "5px",
    },
  };

  return (
    <nav style={styles.container}>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/catalogo" style={styles.link}>
          Catálogo
        </Link>
        <Link to="/carrito" style={styles.link}>
          Carrito
        </Link>
        {rol === "administrador" && (
          <>
            <Link to="/admin/productos" style={styles.link}>
              Admin Productos
            </Link>
            <Link to="/admin/pedidos" style={styles.link}>
              Admin Pedidos
            </Link>
          </>
        )}
      </div>
      <div style={styles.navLinks}>
        {token ? (
          <>
            <Link to="/perfil" style={styles.link}>
              Perfil
            </Link>
            <Link to="/historial-pedidos" style={styles.link}>
              Mis Pedidos
            </Link>
            <button onClick={handleLogout} style={styles.button}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/registro" style={styles.link}>
              Registro
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
