import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Agrega un producto al carrito (o aumenta su cantidad)
  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const exists = prev.find(
        (item) => item.productoID === product.productoID
      );
      if (exists) {
        return prev.map((item) =>
          item.productoID === product.productoID
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // Elimina un producto del carrito
  const removeFromCart = (productoID) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productoID !== productoID)
    );
  };

  // Actualiza la cantidad de un producto
  const updateQuantity = (productoID, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productoID === productoID
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Limpia todo el carrito
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
