const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Producto } = require("../models"); // <-- Importar modelo de Producto
const authenticateToken = require("../middlewares/auth");

router.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res
        .status(400)
        .json({ message: "No hay productos en el carrito." });
    }

    //Validar stock de cada item
    for (const item of items) {
      const productoID = item.productoID ?? item.id;
      const cantidad = Number(item.quantity ?? item.cantidad) || 0;

      const producto = await Producto.findByPk(productoID);
      if (!producto) {
        return res
          .status(404)
          .json({ message: `Producto con ID ${productoID} no existe.` });
      }
      if (producto.stock < cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}.`,
        });
      }
    }

    //Calcular total en CLP (sin decimales)
    const rawAmount = items.reduce((sum, item) => {
      const precio = Number(item.precio) || 0;
      const qty = Number(item.quantity ?? item.cantidad) || 0;
      return sum + precio * qty;
    }, 0);
    const amount = Math.round(rawAmount);

    //Validación de monto mínimo permitido por Stripe en CLP
    const MIN_CLP = 450;
    if (amount < MIN_CLP) {
      return res
        .status(400)
        .json({ message: `El monto mínimo para pagar es ${MIN_CLP} CLP.` });
    }

    //Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "clp",
      metadata: { userId: req.user.usuarioID.toString() },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error en /create-payment-intent:", err);
    return res.status(500).json({ message: "Error al crear PaymentIntent" });
  }
});

module.exports = router;
