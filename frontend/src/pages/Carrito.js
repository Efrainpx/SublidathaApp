// src/pages/Carrito.js
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Carrito = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useContext(CartContext);

  const total = cartItems
    .reduce((sum, item) => sum + item.precio * item.quantity, 0)
    .toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Carrito</h2>
        <p>Está vacío.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Tu Carrito</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.productoID} style={{ marginBottom: "1rem" }}>
            <h3>{item.nombre}</h3>
            <p>Precio: ${item.precio}</p>
            <p>
              Cantidad:
              <input
                type="number"
                value={item.quantity}
                min="1"
                style={{ width: "50px", marginLeft: "0.5rem" }}
                onChange={(e) =>
                  updateQuantity(item.productoID, parseInt(e.target.value))
                }
              />
            </p>
            <button onClick={() => removeFromCart(item.productoID)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <h3>Total: ${total}</h3>
      <button onClick={clearCart}>Vaciar Carrito</button>
      {/* Aquí podrías añadir “Proceder al Pago” */}
    </div>
  );
};

export default Carrito;
