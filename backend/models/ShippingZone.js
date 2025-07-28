const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const ShippingZone = sequelize.define(
  "ShippingZone",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    countries: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    states: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    postalCodes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    freeShippingThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    baseRate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    perKgRate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    estimatedDays: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      validate: {
        min: 1,
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["name"],
      },
    ],
  },
)

module.exports = ShippingZone
