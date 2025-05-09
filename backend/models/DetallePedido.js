const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    pedidoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    productoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "DetallePedido",
    timestamps: false,
    //Recordatorio: Esto evita la creación automática de la columna "id"
    id: false,
  }
);

module.exports = DetallePedido;
