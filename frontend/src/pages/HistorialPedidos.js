// src/pages/HistorialPedidos.js
import React, { useState, useEffect } from "react";
import api from "../services/api";

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPedidos(response.data);
      } catch (e) {
        console.error("Error al cargar historial:", e);
        setError(e.response?.data?.message || "No se pudo cargar el historial");
      }
    };
    fetchPedidos();
  }, []);

  if (error) {
    return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;
  }
  if (pedidos.length === 0) {
    return <p style={{ padding: "2rem" }}>No tienes pedidos registrados.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Historial de Pedidos</h2>
      <ul>
        {pedidos.map((p) => (
          <li key={p.pedidoID} style={{ marginBottom: "1.5rem" }}>
            <p>
              <strong>Pedido ID:</strong> {p.pedidoID}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(p.fecha).toLocaleString()}
            </p>
            <p>
              <strong>Estado:</strong> {p.estado}
            </p>
            <details>
              <summary>Ver detalles</summary>
              <ul>
                {p.DetallePedidos.map((d) => (
                  <li key={d.productoID}>
                    {d.cantidad} × {d.Producto.nombre} @ ${d.precioUnitario}
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

export default HistorialPedidos;
