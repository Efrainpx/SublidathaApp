require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.NODE_ENV === "test") {
  // SQLite en memoria para test
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false, // silencia logs en tests
  });
} else {
  // Conexion real a base de datos
  sequelize = new Sequelize(
    process.env.DB_NAME || "SublidathaDB",
    process.env.DB_USER || "root",
    process.env.DB_PASS || "26996052",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
    }
  );
}

module.exports = sequelize;
