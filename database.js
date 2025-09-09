const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "gamepaths.sqlite",
});

module.exports = sequelize;
