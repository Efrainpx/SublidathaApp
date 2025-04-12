const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Producto = require("./Producto");
const Pedido = require("./Pedido");
const DetallePedido = require("./DetallePedido");

// Asociación: Un Usuario tiene muchos Pedidos
Usuario.hasMany(Pedido, { foreignKey: "usuarioID" });
Pedido.belongsTo(Usuario, { foreignKey: "usuarioID" });

// Asociación: Un Pedido tiene muchos DetallePedido
Pedido.hasMany(DetallePedido, { foreignKey: "pedidoID" });
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoID" });

// Asociación: Un Producto tiene muchos DetallePedido
Producto.hasMany(DetallePedido, { foreignKey: "productoID" });
DetallePedido.belongsTo(Producto, { foreignKey: "productoID" });

module.exports = {
  sequelize,
  Usuario,
  Producto,
  Pedido,
  DetallePedido,
};
