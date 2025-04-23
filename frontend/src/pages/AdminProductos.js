// src/pages/AdminProductos.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { FiUpload } from "react-icons/fi";

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
    navigate("/");
  }

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data } = await api.get("/productos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductos(data);
      } catch (e) {
        console.error("Error al cargar productos", e);
      }
    };
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onFileChangeNew = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("precio", form.precio);
    formData.append("stock", form.stock);
    if (file) formData.append("imagen", file);

    try {
      await api.post("/productos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setForm({ nombre: "", descripcion: "", precio: "", stock: "" });
      setFile(null);
      setPreview("");
      // recarga productos
      const { data } = await api.get("/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(data);
    } catch (e) {
      console.error("Error al crear producto", e);
    }
  };

  const handleImageChange = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("imagen", file);
    try {
      await api.put(`/productos/${id}/imagen`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // recarga productos después de actualizar imagen
      const { data } = await api.get("/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(data);
    } catch (e) {
      console.error(`Error al actualizar imagen del producto ${id}`, e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Administrar Productos
        </h2>

        {/* Formulario de creación */}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                name="precio"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Imagen</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
                <FiUpload className="mr-2" /> Seleccionar imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChangeNew}
                  className="hidden"
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Agregar Producto
          </button>
        </form>

        {/* Lista de productos */}
        <h3 className="text-xl font-semibold mt-8 mb-4">
          Productos existentes
        </h3>
        <ul className="space-y-4">
          {productos.map((p) => (
            <li key={p.productoID} className="flex items-center space-x-4">
              {p.imagen ? (
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded" />
              )}
              <span className="flex-1">{p.nombre}</span>
              {/* Botón para cambiar imagen */}
              <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
                <FiUpload className="mr-1" /> Cambiar Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(p.productoID, e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminProductos;
