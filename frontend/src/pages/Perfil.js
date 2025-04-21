// src/pages/Perfil.js
import React, { useState, useEffect } from "react";
import api from "../services/api";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(response.data);
      } catch (e) {
        console.error("Error al cargar perfil:", e);
        setError(e.response?.data?.message || "No se pudo cargar el perfil");
      }
    };
    fetchPerfil();
  }, []);

  if (error) {
    return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;
  }
  if (!usuario) {
    return <p style={{ padding: "2rem" }}>Cargando perfil…</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Perfil de Usuario</h2>
      <p>
        <strong>ID:</strong> {usuario.usuarioID}
      </p>
      <p>
        <strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}
      </p>
      <p>
        <strong>Email:</strong> {usuario.email}
      </p>
      <p>
        <strong>Rol:</strong> {usuario.rol}
      </p>
      {/* Aquí podrías añadir un formulario para editar datos */}
    </div>
  );
};

export default Perfil;
