import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { FiPlus, FiMinus } from "react-icons/fi";

const Carrito = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useContext(CartContext);

  const total = cartItems
    .reduce((sum, item) => sum + Number(item.precio) * item.quantity, 0)
    .toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600 text-lg">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Tu Carrito</h2>
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.productoID}
              className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row items-center"
            >
              {item.imagen && (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-full md:w-32 h-32 object-cover rounded mb-4 md:mb-0 md:mr-6"
                />
              )}
              <div className="flex-1 w-full">
                <h3 className="text-xl font-semibold">{item.nombre}</h3>
                <p className="text-gray-600 mt-1">
                  ${Number(item.precio).toFixed(2)}
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productoID,
                        item.quantity > 1 ? item.quantity - 1 : 1
                      )
                    }
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    <FiMinus className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="w-8 text-center text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productoID, item.quantity + 1)
                    }
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <FiPlus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.productoID)}
                className="mt-4 md:mt-0 md:ml-6 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          ))}

          {/* Total y acciones */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              Total: ${total}
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <button
                onClick={clearCart}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Vaciar Carrito
              </button>
              <button
                onClick={() => alert("Aquí iría el flujo de pago (sandbox)")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
