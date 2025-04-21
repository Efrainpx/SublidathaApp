// src/pages/AdminPedidos.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminPedidos = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let rol = null;
  if (token) {
    try {
      rol = jwtDecode(token).rol;
    } catch {}
  }
  if (rol !== "administrador") {
    navigate("/");
  }

  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Defino la función dentro del efecto
    const fetchPedidos = async () => {
      try {
        const res = await api.get("/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPedidos(res.data);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar pedidos");
      }
    };
    // 2. La llamo inmediatamente
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ninguna dependencia, solo se ejecuta una vez

  const handleStatus = async (id) => {
    const nuevoEstado = prompt(
      "Nuevo estado (pendiente, confirmado, enviado, cancelado):"
    );
    if (!nuevoEstado) return;
    try {
      await api.put(
        `/pedidos/${id}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reutilizamos el mismo efecto llamando de nuevo a fetchPedidos:
      // pero como está dentro de useEffect, podemos repetir aquí la misma lógica:
      const res = await api.get("/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedidos(res.data);
    } catch (e) {
      console.error(e);
      setError("Error al actualizar estado");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin: Gestión de Pedidos</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {pedidos.map((p) => (
          <li key={p.pedidoID} style={{ marginBottom: "1.5rem" }}>
            <p>
              <strong>ID:</strong> {p.pedidoID} – <strong>Usuario:</strong>{" "}
              {p.usuarioID}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(p.fecha).toLocaleString()}
            </p>
            <p>
              <strong>Estado:</strong> {p.estado}
            </p>
            <button onClick={() => handleStatus(p.pedidoID)}>
              Cambiar Estado
            </button>
            <details>
              <summary>Ver detalle</summary>
              <ul>
                {p.DetallePedidos.map((d) => (
                  <li key={d.productoID}>
                    {d.cantidad}× {d.Producto.nombre} @ ${d.precioUnitario}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPedidos;
