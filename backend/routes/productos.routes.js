// routes/productos.routes.js
const express = require("express");
const router = express.Router();
const { Producto } = require("../models");

// Importar middlewares de autenticación y autorización
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

// Endpoint para listar todos los productos (público)
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.findAll();
    return res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Endpoint para obtener los detalles de un producto por su ID (público)
router.get("/:id", async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    return res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Endpoint para agregar un nuevo producto (solo para administradores)
router.post(
  "/",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, imagen } = req.body;
      if (!nombre || precio === undefined || stock === undefined) {
        return res
          .status(400)
          .json({
            message:
              "Faltan datos requeridos. Se requiere al menos nombre, precio y stock.",
          });
      }
      const nuevoProducto = await Producto.create({
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
      });
      return res.status(201).json({
        message: "Producto creado correctamente",
        producto: nuevoProducto,
      });
    } catch (error) {
      console.error("Error al agregar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Endpoint para actualizar un producto (solo para administradores)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      const { nombre, descripcion, precio, stock, imagen } = req.body;
      producto.nombre = nombre !== undefined ? nombre : producto.nombre;
      producto.descripcion =
        descripcion !== undefined ? descripcion : producto.descripcion;
      producto.precio = precio !== undefined ? precio : producto.precio;
      producto.stock = stock !== undefined ? stock : producto.stock;
      producto.imagen = imagen !== undefined ? imagen : producto.imagen;
      await producto.save();
      return res.json({
        message: "Producto actualizado correctamente",
        producto,
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Endpoint para eliminar un producto (solo para administradores)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      await producto.destroy();
      return res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

module.exports = router;
