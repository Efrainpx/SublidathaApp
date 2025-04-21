// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";

// 1. Localiza el elemento donde montaremos la app
const container = document.getElementById("root");

// 2. Crea el root con la nueva API
const root = createRoot(container);

// 3. Renderiza tu aplicación envolviéndola con el provider del carrito
root.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
