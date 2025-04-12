const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Pedido = sequelize.define(
  "Pedido",
  {
    pedidoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmado", "enviado", "cancelado"),
      defaultValue: "pendiente",
    },
  },
  {
    tableName: "Pedido",
    timestamps: false,
  }
);

// Asociación: Un Pedido pertenece a un Usuario (cliente)
Pedido.belongsTo(Usuario, { foreignKey: "usuarioID" });

module.exports = Pedido;
