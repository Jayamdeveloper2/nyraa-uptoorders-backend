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
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("creditCard", "debitCard", "paypal", "cashOnDelivery"),
      defaultValue: "creditCard",
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
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    billingAddress: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["paymentStatus"],
      },
      {
        fields: ["createdAt"],
      },
      {
        unique: true,
        fields: ["orderNumber"],
      },
    ],
  },
)

module.exports = Order
