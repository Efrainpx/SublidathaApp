require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

// Habilita CORS y JSON
app.use(cors());
app.use(express.json());

// Sirve archivos estáticos de la carpeta uploads
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

if (process.env.NODE_ENV !== "test") {
  sequelize.sync().then(() => {
    app.listen(port, () => {
      console.log(`Servidor en puerto ${port}`);
    });
  });
}

module.exports = app;
