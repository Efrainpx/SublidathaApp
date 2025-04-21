import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminProductos = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let rol = null;
  if (token) {
    try {
      rol = jwtDecode(token).rol;
    } catch {}
  }
  if (rol !== "administrador") {
    navigate("/"); // redirige si no es admin
  }

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
  });
  const [error, setError] = useState("");

  const fetchProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar productos");
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/productos", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        imagen: "",
      });
      fetchProductos();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Error al agregar");
    }
  };

  const handleUpdate = async (id, campo, valor) => {
    try {
      await api.put(
        `/productos/${id}`,
        { [campo]: valor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProductos();
    } catch (e) {
      console.error(e);
      setError("Error al actualizar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProductos();
    } catch (e) {
      console.error(e);
      setError("Error al eliminar");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin: Gestión de Productos</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleAdd} style={{ marginBottom: "2rem" }}>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
        />
        <input
          name="precio"
          value={form.precio}
          onChange={handleChange}
          placeholder="Precio"
          required
        />
        <input
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          required
        />
        <input
          name="imagen"
          value={form.imagen}
          onChange={handleChange}
          placeholder="URL imagen"
        />
        <button type="submit">Agregar Producto</button>
      </form>
      <ul>
        {productos.map((p) => (
          <li key={p.productoID} style={{ marginBottom: "1rem" }}>
            <strong>{p.nombre}</strong> — ${p.precio} — Stock: {p.stock}
            <button
              onClick={() => handleDelete(p.productoID)}
              style={{ marginLeft: "1rem" }}
            >
              Eliminar
            </button>
            <button
              onClick={() => {
                const nuevoPrecio = prompt("Nuevo precio:", p.precio);
                if (nuevoPrecio)
                  handleUpdate(p.productoID, "precio", nuevoPrecio);
              }}
            >
              Editar Precio
            </button>
            {/* similarmente puedes editar stock, nombre, etc. */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminProductos;
