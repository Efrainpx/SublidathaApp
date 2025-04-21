import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";

const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api
      .get(`/productos/${id}`)
      .then((res) => setProducto(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!producto) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{producto.nombre}</h2>
      <p>{producto.descripcion}</p>
      <p>Precio: ${producto.precio}</p>
      <p>Stock: {producto.stock}</p>
      {producto.imagen && (
        <img
          src={producto.imagen}
          alt={producto.nombre}
          style={{ maxWidth: "300px" }}
        />
      )}
      <button onClick={() => addToCart(producto)}>Agregar al Carrito</button>
    </div>
  );
};

export default DetalleProducto;
