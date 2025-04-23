const express = require("express");
const router = express.Router();
const { Pedido, DetallePedido, Producto } = require("../models");
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

// Crear un pedido (El usuario autenticado crea su pedido)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { detalles } = req.body;
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res
        .status(400)
        .json({ message: "Se requieren detalles del pedido." });
    }
    const usuarioID = req.user.usuarioID;
    // Crear el pedido con el usuario autenticado
    const nuevoPedido = await Pedido.create({ usuarioID });

    // Crear cada uno de los detalles del pedido
    const detallesCreados = await Promise.all(
      detalles.map(async (detalle) => {
        const { productoID, cantidad, precioUnitario } = detalle;
        // Verificar que el producto exista
        const producto = await Producto.findByPk(productoID);
        if (!producto) {
          throw new Error(`Producto con ID ${productoID} no existe.`);
        }
        return await DetallePedido.create({
          pedidoID: nuevoPedido.pedidoID,
          productoID,
          cantidad,
          precioUnitario,
        });
      })
    );

    return res.status(201).json({
      message: "Pedido creado correctamente",
      pedido: nuevoPedido,
      detalles: detallesCreados,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Listar pedidos
// Si el usuario es cliente, se listan solo sus pedidos; si es administrador, se listan todos.
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Los admins ven todos, los clientes sólo sus propios pedidos
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
    // Si el usuario es cliente, sólo puede acceder a su propio pedido.
    if (req.user.rol === "cliente" && pedido.usuarioID !== req.user.usuarioID) {
      return res.status(403).json({ message: "Acceso denegado a este pedido" });
    }
    return res.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

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
