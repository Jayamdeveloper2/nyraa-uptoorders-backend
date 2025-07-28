const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("percentage", "fixed", "free_shipping"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    minPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    userLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Expired"),
      defaultValue: "Active",
    },
    applicableProducts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    applicableCategories: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    excludedProducts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    excludedCategories: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    firstTimeOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    autoApply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["code"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["startDate", "endDate"],
      },
      {
        fields: ["type"],
      },
    ],
  },
)

module.exports = Coupon
