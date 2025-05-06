// backend/routes/pagos.routes.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require("../middlewares/auth");

router.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res
        .status(400)
        .json({ message: "No hay productos en el carrito." });
    }

    // Suma CLP sin decimales
    const rawAmount = items.reduce((sum, item) => {
      const precio = Number(item.precio) || 0;
      const qty = Number(item.quantity ?? item.cantidad) || 0;
      return sum + precio * qty;
    }, 0);
    // Redondea
    const amount = Math.round(rawAmount);

    // Mínimo en CLP para que Stripe acepte el cargo:
    const MIN_CLP = 450;
    if (amount < MIN_CLP) {
      return res
        .status(400)
        .json({ message: `El monto mínimo para pagar es ${MIN_CLP} CLP.` });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "clp",
      metadata: { userId: req.user.usuarioID.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error en /create-payment-intent:", err);
    res.status(500).json({ message: "Error al crear PaymentIntent" });
  }
});

module.exports = router;
