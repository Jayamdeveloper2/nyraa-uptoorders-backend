const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    variant: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    indexes: [
      {
        fields: ["orderId"],
      },
      {
        fields: ["productId"],
      },
    ],
  },
)

module.exports = OrderItem
