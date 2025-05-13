const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Producto } = require("../models");
// Importar middlewares de autenticación y autorización
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

// Multer storage para imágenes de productos
const prodStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `producto_${Date.now()}`;
    cb(null, name + ext);
  },
});
const uploadProductImage = multer({ storage: prodStorage });

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Gestión de productos
 */

//Endpoint para crear producto con imagen
router.post(
  "/",
  authenticateToken,
  uploadProductImage.single("imagen"),
  async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock } = req.body;
      const imagenUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : null;

      const prod = await Producto.create({
        nombre,
        descripcion,
        precio,
        stock,
        imagen: imagenUrl,
      });
      res.status(201).json(prod);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear producto" });
    }
  }
);

/**
 * @swagger
 * /api/productos/{id}/imagen:
 *   put:
 *     summary: Actualizar solo la imagen de un producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente
 *       400:
 *         description: Imagen faltante o inválida
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */

//Endpoint para actualizar sólo la imagen de un producto
router.put(
  "/:id/imagen",
  authenticateToken,
  uploadProductImage.single("imagen"),
  async (req, res) => {
    try {
      const prod = await Producto.findByPk(req.params.id);
      if (!prod)
        return res.status(404).json({ message: "Producto no encontrado" });

      prod.imagen = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      await prod.save();
      res.json({
        message: "Imagen de producto actualizada",
        imagen: prod.imagen,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar imagen" });
    }
  }
);

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar todos los productos (público)
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */

// Endpoint para listar todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.findAll();
    return res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener detalles de un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Producto no encontrado
 */

// Endpoint para obtener los detalles de un producto por su ID
router.get("/:id", async (req, res) => {
  try {
    const prod = await Producto.findByPk(req.params.id);
    if (!prod)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.json(prod);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - stock
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos faltantes o inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso prohibido
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para agregar un nuevo producto (solo para administradores)
router.post(
  "/",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, imagen } = req.body;
      if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({
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

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto completo (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto a actualizar
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */

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

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto a eliminar
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para eliminar un producto (solo para administradores)
const { Producto, DetallePedido } = require("../models");

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    const productoID = parseInt(req.params.id, 10);

    try {
      // Comprueba que el producto existe
      const producto = await Producto.findByPk(productoID);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Elimina primero todos los detalles de pedido que referencien este producto
      await DetallePedido.destroy({
        where: { productoID },
      });

      // Ahora elimina el producto
      await Producto.destroy({
        where: { productoID },
      });

      return res.json({
        message: "Producto y sus detalles eliminados correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

module.exports = router;
