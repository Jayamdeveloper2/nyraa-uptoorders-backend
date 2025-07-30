const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "United States",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("home", "work", "other"),
      defaultValue: "home",
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["isDefault"],
      },
    ],
  },
)

module.exports = Address
