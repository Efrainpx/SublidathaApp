import React, { useState, useEffect } from "react";
import api from "../services/api";

const statusColors = {
  Pendiente: "bg-yellow-200 text-yellow-800",
  Confirmado: "bg-blue-200 text-blue-800",
  Enviado: "bg-green-200 text-green-800",
  Cancelado: "bg-red-200 text-red-800",
};

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPedidos(data);
      } catch (e) {
        setError(e.response?.data?.message || "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando historial…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">No tienes pedidos registrados.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Historial de Pedidos
        </h2>
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const total = pedido.DetallePedidos.reduce(
              (sum, d) => sum + Number(d.cantidad) * Number(d.precioUnitario),
              0
            );
            // Capitaliza primera letra del estado
            const estadoCapitalizado =
              pedido.estado.charAt(0).toUpperCase() +
              pedido.estado.slice(1).toLowerCase();

            return (
              <div
                key={pedido.pedidoID}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between mb-4">
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Pedido ID:</span>{" "}
                      {pedido.pedidoID}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(pedido.fecha).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Total:</span> $
                      {total.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        statusColors[estadoCapitalizado] ||
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {estadoCapitalizado}
                    </span>
                  </div>
                </div>
                <details className="text-gray-700">
                  <summary className="cursor-pointer font-medium">
                    Ver detalles
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {pedido.DetallePedidos.map((d) => (
                      <li
                        key={d.productoID}
                        className="flex justify-between border-b pb-1"
                      >
                        <span>
                          {d.cantidad} × {d.Producto.nombre}
                        </span>
                        <span>${Number(d.precioUnitario).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistorialPedidos;
