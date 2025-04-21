// src/pages/Registro.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    telefono: "",
    // El rol por defecto es "cliente". Si se requiere otro, se podría cambiar desde aquí o en el backend.
    rol: "cliente",
  });
  const [mensaje, setMensaje] = useState("");

  // Manejador de cambios para cada campo
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/usuarios/register", formData);
      setMensaje(response.data.message);
      // Después de un registro exitoso, redirige a la página de Login
      navigate("/login");
    } catch (error) {
      console.error(
        "Error en registro:",
        error.response ? error.response.data : error
      );
      setMensaje(error.response?.data?.message || "Error en el registro.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Apellido:</label>
          <input
            type="text"
            name="apellido"
            placeholder="Tu apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Tu email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Dirección:</label>
          <input
            type="text"
            name="direccion"
            placeholder="Tu dirección"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            name="telefono"
            placeholder="Tu teléfono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Registro;
