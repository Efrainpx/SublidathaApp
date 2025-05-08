// src/pages/Checkout.js
import React, { useContext, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { CartContext } from "../context/CartContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);

  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // 1) Calcular total
    const t = cartItems.reduce(
      (sum, item) => sum + Number(item.precio) * Number(item.quantity),
      0
    );
    setTotal(t);
    setError("");

    // 2) Validar monto mínimo en CLP
    const MIN_CLP = 450;
    if (t < MIN_CLP) {
      setError(`Para pagar necesitas al menos ${MIN_CLP} CLP en el carrito.`);
      return;
    }

    // 3) Crear PaymentIntent sólo si no hay error de mínimo
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.post(
          "/pagos/create-payment-intent",
          { items: cartItems },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(data.clientSecret);
      } catch (err) {
        // Captura errores de stock insuficiente u otros
        setError(
          err.response?.data?.message ||
            "Error al preparar el pago, inténtalo más tarde."
        );
      }
    })();
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // No avanzar si hay error o falta clientSecret
    if (error || !clientSecret) return;
    setProcessing(true);

    const card = elements.getElement(CardElement);
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // 1) Crear pedido en backend
      try {
        const token = localStorage.getItem("token");
        await api.post(
          "/pedidos",
          {
            detalles: cartItems.map((item) => ({
              productoID: item.productoID,
              cantidad: item.quantity,
              precioUnitario: item.precio,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 2) Vaciar carrito y marcar éxito
        clearCart();
        setSucceeded(true);
        setError("");

        // 3) Redirigir a historial de pedidos después de un breve delay
        setTimeout(() => {
          navigate("/historial-pedidos");
        }, 1500);
      } catch (err) {
        console.error("Error al crear pedido:", err);
        setError("Pago realizado, pero no se pudo crear el pedido.");
      } finally {
        setProcessing(false);
      }
    } else {
      setError("El pago no se completó correctamente.");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

      {/* Mostrar mensajes de error (stock, Stripe, pedido) */}
      {error && !succeeded && (
        <p className="text-red-500 mb-4 text-center">{error}</p>
      )}

      {succeeded ? (
        <p className="text-green-600 text-center">
          ¡Pago y pedido realizados con éxito! Redirigiendo…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardElement
            options={{ hidePostalCode: true }}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {processing ? "Procesando..." : `Pagar ${total.toFixed(2)} CLP`}
          </button>
        </form>
      )}
    </div>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
