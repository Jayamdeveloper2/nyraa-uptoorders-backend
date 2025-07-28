const { DataTypes } = require("sequelize")
const sequelize = require("../../config/db")

const Size = sequelize.define(
  "Size",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "sizes",
    timestamps: true,
  },
)

module.exports = Size