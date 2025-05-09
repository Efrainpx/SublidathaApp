const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Producto = require("./Producto");
const Pedido = require("./Pedido");
const DetallePedido = require("./DetallePedido");

//Usuario ↔ Pedido
Usuario.hasMany(Pedido, { foreignKey: "usuarioID" });
Pedido.belongsTo(Usuario, { foreignKey: "usuarioID" });

//Pedido ↔ DetallePedido
Pedido.hasMany(DetallePedido, { foreignKey: "pedidoID", as: "DetallePedidos" });
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoID" });

//Producto ↔ DetallePedido
Producto.hasMany(DetallePedido, { foreignKey: "productoID" });
DetallePedido.belongsTo(Producto, { foreignKey: "productoID" });

module.exports = {
  sequelize,
  Usuario,
  Producto,
  Pedido,
  DetallePedido,
};
