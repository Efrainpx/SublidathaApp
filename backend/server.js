require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
const usuariosRoutes = require("./routes/usuarios.routes");
const productosRoutes = require("./routes/productos.routes");
const pedidosRoutes = require("./routes/pedidos.routes");
const pagosRoutes = require("./routes/pagos.routes");
const adminRoutes = require("./routes/admin.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/", (req, res) => res.send("API SublidathaApp OK"));

// Solo en desarrollo sincronizamos tablas antes de arrancar
if (process.env.NODE_ENV === "development") {
  sequelize.sync().then(() => {
    app.listen(port, () => {
      console.log(`Servidor DEV en puerto ${port}`);
    });
  });
}
// En producción (y cualquier otro entorno distinto de test), arrancamos sin sync
else if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor en puerto ${port}`);
  });
}

module.exports = app;
