import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { FiUpload } from "react-icons/fi";

const AdminProductos = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Verificar rol administrador
  let rol = null;
  if (token) {
    try {
      rol = jwtDecode(token).rol;
    } catch {}
  }
  if (rol !== "administrador") {
    navigate("/");
  }

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  // Estados creación
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });
  const [file, setFile] = useState(null);

  // Estados edición inline
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
  });

  // Carga inicial de productos
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/productos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductos(data);
      } catch (e) {
        console.error("Error al cargar productos", e);
        setError("No se pudo cargar los productos");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— CREACIÓN —— //
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
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
      // reset
      setForm({ nombre: "", descripcion: "", precio: "", stock: "" });
      setFile(null);
      // recarga
      const { data } = await api.get("/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(data);
    } catch (e) {
      console.error("Error al crear producto", e);
      setError("No se pudo crear el producto");
    }
  };

  // —— CAMBIO DE IMAGEN —— //
  const handleImageChange = async (id, file) => {
    if (!file) return;
    setError("");
    const formData = new FormData();
    formData.append("imagen", file);
    try {
      await api.put(`/productos/${id}/imagen`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const { data } = await api.get("/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(data);
    } catch (e) {
      console.error(`Error al actualizar imagen ${id}`, e);
      setError("No se pudo actualizar la imagen");
    }
  };

  // —— EDICIÓN INLINE —— //
  const handleEdit = (prod) => {
    setEditingId(prod.productoID);
    setEditForm({
      nombre: prod.nombre,
      precio: prod.precio,
      stock: prod.stock,
    });
    setError("");
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ nombre: "", precio: "", stock: "" });
    setError("");
  };
  const handleSave = async (id) => {
    const { nombre, precio, stock } = editForm;
    if (!nombre.trim() || isNaN(Number(precio)) || isNaN(Number(stock))) {
      setError("Nombre no vacío, precio y stock numéricos");
      return;
    }
    setError("");
    try {
      const { data } = await api.put(
        `/productos/${id}`,
        {
          nombre,
          precio: Number(precio),
          stock: Number(stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos((prev) =>
        prev.map((p) => (p.productoID === id ? data.producto : p))
      );
      handleCancel();
    } catch (e) {
      console.error("Error al actualizar producto", e);
      setError("No se pudo actualizar el producto");
    }
  };

  // —— ELIMINAR —— //
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setError("");
    try {
      await api.delete(`/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.productoID !== id));
    } catch (e) {
      console.error("Error al eliminar producto", e);
      setError("No se pudo eliminar el producto");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="container mx-auto max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Administrar Productos
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* === FORM CREAR === */}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
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
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
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
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Agregar Producto
          </button>
        </form>

        {/* === LISTA EXISTENTE === */}
        <h3 className="text-xl font-semibold mt-8 mb-4">
          Productos existentes
        </h3>
        <ul className="space-y-4">
          {productos.map((p) => (
            <li
              key={p.productoID}
              className="flex items-center space-x-4 bg-white p-4 rounded shadow"
            >
              {p.imagen ? (
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded" />
              )}

              {editingId === p.productoID ? (
                <>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombre: e.target.value })
                    }
                    className="border p-1 rounded w-24"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.precio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precio: e.target.value })
                    }
                    className="border p-1 rounded w-20"
                  />
                  <input
                    type="number"
                    step="1"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    className="border p-1 rounded w-20"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(p.productoID)}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition"
                  >
                    Cancelar
                  </button>
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
                </>
              ) : (
                <>
                  <span className="flex-1">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-gray-600">
                      ${p.precio} – Stock: {p.stock}
                    </p>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.productoID)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminProductos;
