// backend/models/index.js
const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Producto = require("./Producto");
const Pedido = require("./Pedido");
const DetallePedido = require("./DetallePedido");

// 1) Usuario ↔ Pedido (sin alias obligatorio)
Usuario.hasMany(Pedido, { foreignKey: "usuarioID" });
Pedido.belongsTo(Usuario, { foreignKey: "usuarioID" });

// 2) Pedido ↔ DetallePedido **con** alias
Pedido.hasMany(DetallePedido, { foreignKey: "pedidoID", as: "DetallePedidos" });
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoID" });

// 3) Producto ↔ DetallePedido (sin alias obligatorio)
Producto.hasMany(DetallePedido, { foreignKey: "productoID" });
DetallePedido.belongsTo(Producto, { foreignKey: "productoID" });

module.exports = {
  sequelize,
  Usuario,
  Producto,
  Pedido,
  DetallePedido,
};
