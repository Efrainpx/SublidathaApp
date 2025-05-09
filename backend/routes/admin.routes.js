const express = require("express");
const router = express.Router();
const { Producto, DetallePedido, Pedido, sequelize } = require("../models");
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard de administrador
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Existencias de inventario y ventas mensuales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existencias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductoExistencia'
 *                 ventasPorMes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VentasPorMes'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      //Existencias de inventario
      const existencias = await Producto.findAll({
        attributes: ["productoID", "nombre", "stock"],
        order: [["nombre", "ASC"]],
      });

      //Ventas mensuales del año actual
      const currentYear = new Date().getFullYear();
      const ventasPorMes = await DetallePedido.findAll({
        attributes: [
          [
            //Extrae el mes de la fecha del pedido
            sequelize.fn("MONTH", sequelize.col("Pedido.fecha")),
            "mes",
          ],
          [
            //Suma de (cantidad * precioUnitario)
            sequelize.fn("SUM", sequelize.literal("cantidad * precioUnitario")),
            "total",
          ],
        ],
        include: [
          {
            model: Pedido,
            attributes: [],
            where: sequelize.where(
              sequelize.fn("YEAR", sequelize.col("Pedido.fecha")),
              currentYear
            ),
          },
        ],
        group: ["mes"],
        order: [[sequelize.literal("mes"), "ASC"]],
        raw: true,
      });

      return res.json({ existencias, ventasPorMes });
    } catch (err) {
      console.error("Error en dashboard admin:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos del dashboard" });
    }
  }
);

module.exports = router;
