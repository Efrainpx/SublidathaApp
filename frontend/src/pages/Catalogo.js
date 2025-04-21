import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api
      .get("/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Catálogo de Productos</h2>
      <ul>
        {productos.map((p) => (
          <li key={p.productoID}>
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <p>Precio: ${p.precio}</p>
            <button onClick={() => addToCart(p)}>Agregar al Carrito</button>
            <Link to={`/producto/${p.productoID}`}> Ver detalles</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Catalogo;
