const express = require("express");
const router = express.Router();
const { Pedido, DetallePedido, Producto, sequelize } = require("../models");
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DetallePedido:
 *       type: object
 *       properties:
 *         productoID:
 *           type: integer
 *         cantidad:
 *           type: integer
 *         precioUnitario:
 *           type: number
 *           format: float
 *     Pedido:
 *       type: object
 *       properties:
 *         pedidoID:
 *           type: integer
 *         usuarioID:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *         DetallePedidos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetallePedido'
 */

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crea un nuevo pedido para el usuario autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               detalles:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/DetallePedido'
 *             required:
 *               - detalles
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *                 detalles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DetallePedido'
 *       400:
 *         description: Se requieren detalles del pedido o stock insuficiente
 *       500:
 *         description: Error en el servidor
 */

//Crear un pedido (El usuario autenticado crea su pedido)
router.post("/", authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { detalles } = req.body;
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Se requieren detalles del pedido." });
    }

    const usuarioID = req.user.usuarioID;

    //Crear el pedido
    const nuevoPedido = await Pedido.create({ usuarioID }, { transaction: t });

    //Procesar cada detalle: verificar stock, crear detalle, descontar stock
    const detallesCreados = [];
    for (const d of detalles) {
      const { productoID, cantidad, precioUnitario } = d;

      //Verificar existencia y stock suficiente
      const producto = await Producto.findByPk(productoID, { transaction: t });
      if (!producto) {
        throw new Error(`Producto con ID ${productoID} no existe.`);
      }
      if (producto.stock < cantidad) {
        throw new Error(
          `Stock insuficiente para producto ${productoID}. Disponible: ${producto.stock}`
        );
      }

      //Crear registro de detalle de pedido
      const detalle = await DetallePedido.create(
        {
          pedidoID: nuevoPedido.pedidoID,
          productoID,
          cantidad,
          precioUnitario,
        },
        { transaction: t }
      );
      detallesCreados.push(detalle);

      //Descontar stock y guardar
      producto.stock -= cantidad;
      await producto.save({ transaction: t });
    }

    //Todo OK: confirmar transacción
    await t.commit();

    return res.status(201).json({
      message: "Pedido creado correctamente",
      pedido: nuevoPedido,
      detalles: detallesCreados,
    });
  } catch (error) {
    // En caso de error, revertir transacción
    await t.rollback();
    console.error("Error al crear pedido:", error);
    const status = error.message.startsWith("Stock insuficiente") ? 400 : 500;
    return res.status(status).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Lista todos los pedidos (admins) o los del usuario (clientes)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       500:
 *         description: Error en el servidor
 */

// Listar pedidos
// Si el usuario es cliente, se listan solo sus pedidos; si es administrador, se listan todos.
router.get("/", authenticateToken, async (req, res) => {
  try {
    const where =
      req.user.rol === "administrador" ? {} : { usuarioID: req.user.usuarioID };

    const pedidos = await Pedido.findAll({
      where,
      include: [
        {
          model: DetallePedido,
          as: "DetallePedidos",
          include: [{ model: Producto }],
        },
      ],
    });

    res.json(pedidos);
  } catch (err) {
    console.error("Error al listar pedidos:", err);
    res.status(500).json({ message: "Error al listar pedidos" });
  }
});

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtiene un pedido por su ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       403:
 *         description: Acceso denegado al pedido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error en el servidor
 */

// Obtener los detalles de un pedido específico
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        {
          model: DetallePedido,
          as: "DetallePedidos",
          include: [{ model: Producto }],
        },
      ],
    });
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    if (req.user.rol === "cliente" && pedido.usuarioID !== req.user.usuarioID) {
      return res.status(403).json({ message: "Acceso denegado a este pedido" });
    }
    return res.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Actualiza el estado de un pedido (solo admins)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *             required:
 *               - estado
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: El estado es requerido
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error en el servidor
 */

// Actualizar el estado de un pedido (solo para administradores)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ message: "El estado es requerido" });
      }
      const pedido = await Pedido.findByPk(req.params.id);
      if (!pedido) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }
      pedido.estado = estado;
      await pedido.save();
      return res.json({
        message: "Estado del pedido actualizado correctamente",
        pedido,
      });
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

module.exports = router;
