const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const GamePath = sequelize.define("GamePath", {
  player: DataTypes.STRING,
  won: DataTypes.BOOLEAN,
  timestamp: DataTypes.STRING,
  path: DataTypes.TEXT, 
  mode: DataTypes.STRING,
  skillLevel: DataTypes.STRING,
  defenceMaturity: DataTypes.STRING,
  score: DataTypes.INTEGER,
  events: DataTypes.TEXT,
});

module.exports = GamePath;
