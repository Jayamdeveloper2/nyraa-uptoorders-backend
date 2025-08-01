const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled", "returned"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      defaultValue: "creditCard",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "INR",
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    actualDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    billingAddress: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders", // Use lowercase table name to match SQL
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "status"],
      },
      {
        fields: ["orderDate", "status"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["paymentStatus"],
      },
    ],
  },
)

module.exports = Order
