import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const statusColors = {
  Pendiente: "bg-yellow-200 text-yellow-800",
  Confirmado: "bg-blue-200 text-blue-800",
  Enviado: "bg-green-200 text-green-800",
  Cancelado: "bg-red-200 text-red-800",
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const { data } = await api.get("/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPedidos(data);
      } catch (e) {
        console.error("Error al cargar pedidos", e);
        setError("No se pudo cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (id) => {
    const nuevo = prompt(
      "Nuevo estado (pendiente, confirmado, enviado, cancelado):"
    );
    if (!nuevo) return;

    try {
      await api.put(
        `/pedidos/${id}`,
        { estado: nuevo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // recargar lista
      const { data } = await api.get("/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedidos(data);
    } catch {
      setError("Error al actualizar estado");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando pedidos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">No hay pedidos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Admin: Gestión de Pedidos
        </h2>
        <div className="space-y-6">
          {pedidos.map((p) => {
            // calcula total del pedido
            const total = p.DetallePedidos.reduce(
              (sum, d) => sum + Number(d.cantidad) * Number(d.precioUnitario),
              0
            );
            // capitaliza estado
            const estadoCap =
              p.estado.charAt(0).toUpperCase() +
              p.estado.slice(1).toLowerCase();

            return (
              <div
                key={p.pedidoID}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between mb-4">
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">Pedido ID:</span>{" "}
                      {p.pedidoID}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Usuario ID:</span>{" "}
                      {p.usuarioID}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(p.fecha).toLocaleString()}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Total:</span> $
                      {total.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        statusColors[estadoCap] || "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {estadoCap}
                    </span>
                    <button
                      onClick={() => changeStatus(p.pedidoID)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Cambiar Estado
                    </button>
                  </div>
                </div>
                <details className="text-gray-700">
                  <summary className="cursor-pointer font-medium">
                    Ver detalles del pedido
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {p.DetallePedidos.map((d) => (
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

export default AdminPedidos;
