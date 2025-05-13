require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.NODE_ENV === "test") {
  // SQLite en memoria para tests
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
} else {
  // Conexión real a base de datos MySQL en FreeSQLDatabase.com
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
    }
  );
}

module.exports = sequelize;
