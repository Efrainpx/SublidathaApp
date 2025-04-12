const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { sequelize } = require("./models"); // Importamos la conexión y los modelos
require("dotenv").config();

app.use(express.json());

// Rutas de la API
const usuariosRoutes = require("./routes/usuarios.routes");
const productosRoutes = require("./routes/productos.routes");
const pedidosRoutes = require("./routes/pedidos.routes");

// Uso de las rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);

app.get("/", (req, res) => {
  res.send("API de SublidathaApp funcionando");
});

// Sincronizamos la base de datos y arrancamos el servidor
sequelize
  .sync()
  .then(() => {
    console.log("Base de datos sincronizada");
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch((err) => console.error("Error al sincronizar la base de datos:", err));
