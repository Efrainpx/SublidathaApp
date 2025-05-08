// src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let rol = null;
  if (token) {
    try {
      rol = jwtDecode(token).rol;
    } catch {}
  }
  // Si no es admin, redirigir
  useEffect(() => {
    if (rol !== "administrador") {
      navigate("/");
    }
  }, [rol, navigate]);

  const [existencias, setExistencias] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setExistencias(data.existencias);

        // Convertir {mes: 1, total: "12345.67"} a {mes: "Ene", total: 12345.67}
        const ventas = data.ventasPorMes.map((item) => ({
          mes: monthNames[item.mes - 1] || item.mes,
          total: parseFloat(item.total),
        }));
        setVentasMes(ventas);
      } catch (e) {
        console.error("Error al cargar dashboard:", e);
        setError("No se pudo cargar datos del dashboard");
      }
    };

    fetchDashboard();
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Panel de Control Admin
        </h1>

        {/* Existencias */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Existencias actuales</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Producto</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {existencias.map((p) => (
                  <tr key={p.productoID} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.productoID}</td>
                    <td className="border px-4 py-2">{p.nombre}</td>
                    <td className="border px-4 py-2">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ventas mensuales */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Ventas mensuales</h2>
          <div className="w-full h-64 bg-white p-4 shadow rounded">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasMes}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
