import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await api.get("/productos");
        setProductos(res.data);
      } catch (err) {
        console.error("Error al cargar catálogo:", err);
        setError("No fue posible cargar el catálogo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando catálogo…</p>
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Catálogo de Productos
        </h2>
        {productos.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay productos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div
                key={p.productoID}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Imagen o placeholder */}
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Sin imagen</span>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2">{p.nombre}</h3>
                  <p className="text-gray-700 flex-1">{p.descripcion}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-blue-600 font-bold">
                      ${Number(p.precio).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Añadir
                    </button>
                  </div>

                  <Link
                    to={`/producto/${p.productoID}`}
                    className="mt-3 text-sm text-blue-600 hover:underline self-start"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
