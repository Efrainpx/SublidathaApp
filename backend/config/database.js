const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("SublidathaDB", "root", "26996052", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
