const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
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
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: "creditCard",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    // Fixed: Use JSON type for consistent address storage
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidAddress(value) {
          if (!value || typeof value !== 'object') {
            throw new Error('Shipping address must be a valid object');
          }
          const required = ['name', 'street', 'city', 'state', 'zip', 'phone'];
          for (const field of required) {
            if (!value[field] || value[field].trim() === '') {
              throw new Error(`Address field '${field}' is required`);
            }
          }
        }
      }
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING,
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
        fields: ["orderDate"],
      },
      {
        fields: ["paymentStatus"],
      },
    ],
  },
)

module.exports = Order
