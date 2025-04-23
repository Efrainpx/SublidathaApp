// src/pages/DetalleProducto.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await api.get(`/productos/${id}`);
        setProducto(res.data);
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando detalle…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="m-4 text-blue-600 hover:underline"
        >
          ← Volver
        </button>
        <div className="flex flex-col md:flex-row">
          {/* Imagen o placeholder */}
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full md:w-1/2 h-64 md:h-auto object-cover"
            />
          ) : (
            <div className="w-full md:w-1/2 h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}

          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">{producto.nombre}</h2>
            <p className="text-gray-700 mb-4 flex-1">{producto.descripcion}</p>
            <div className="text-xl font-semibold text-blue-600 mb-6">
              ${Number(producto.precio).toFixed(2)}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => addToCart(producto)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Añadir al Carrito
              </button>
              <span className="text-gray-600">
                Stock: <strong>{producto.stock}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
