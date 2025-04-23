// src/pages/Perfil.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FiUser, FiCamera, FiEdit2, FiSave, FiX } from "react-icons/fi";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    telefono: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(data);
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "",
          password: "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
        });
      } catch {
        setError("No se pudo cargar el perfil");
      }
    };
    fetchPerfil();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post("/usuarios/me/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUsuario((u) => ({ ...u, profileImage: data.profileImage }));
      setFile(null);
      setPreview("");
    } catch {
      setError("Error al subir avatar");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        direccion: form.direccion,
        telefono: form.telefono,
      };
      if (form.password.trim()) payload.password = form.password;

      const { data } = await api.put("/usuarios/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(data);
      setEditing(false);
      setForm((f) => ({ ...f, password: "" }));
    } catch {
      setError("Error al actualizar perfil");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Perfil de Usuario</h2>
          {editing ? (
            <button
              onClick={() => setEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <FiEdit2 size={20} />
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {preview || usuario.profileImage ? (
            <img
              src={preview || usuario.profileImage}
              alt="Avatar"
              className="w-28 h-28 object-cover rounded-full mb-3"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <FiUser className="w-10 h-10 text-gray-500" />
            </div>
          )}
          <label className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-800">
            <FiCamera className="w-5 h-5" />
            <span>{preview ? "Cambiar foto" : "Elegir foto"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          {file && (
            <button
              onClick={uploadAvatar}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Subir Foto
            </button>
          )}
        </div>

        {editing ? (
          <>
            <div className="space-y-3">
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={handleSave}
              className="mt-5 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
            >
              <FiSave className="mr-2" /> Guardar cambios
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Nombre:</span> {usuario.nombre}
            </p>
            <p>
              <span className="font-medium">Apellido:</span> {usuario.apellido}
            </p>
            <p>
              <span className="font-medium">Email:</span> {usuario.email}
            </p>
            <p>
              <span className="font-medium">Dirección:</span>{" "}
              {usuario.direccion || "—"}
            </p>
            <p>
              <span className="font-medium">Teléfono:</span>{" "}
              {usuario.telefono || "—"}
            </p>
            <p>
              <span className="font-medium">Rol:</span> {usuario.rol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
