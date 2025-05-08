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

// 1) Sirve archivos estáticos de la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 2) Rutas
const usuariosRoutes = require("./routes/usuarios.routes");
const productosRoutes = require("./routes/productos.routes");
const pedidosRoutes = require("./routes/pedidos.routes");
const pagosRoutes = require("./routes/pagos.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("API SublidathaApp OK"));

sequelize.sync().then(() => {
  app.listen(port, () => console.log(`Servidor en puerto ${port}`));
});
