// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/usuarios/login", { email, password });
      // Guarda el token, por ejemplo, en localStorage
      localStorage.setItem("token", response.data.token);
      setMensaje("Inicio de sesión exitoso.");
      navigate("/"); // Redirige a la página principal o al catálogo
    } catch (error) {
      console.error(
        "Error de login:",
        error.response ? error.response.data : error
      );
      setMensaje(
        error.response?.data?.message || "Error en el inicio de sesión."
      );
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Login;
