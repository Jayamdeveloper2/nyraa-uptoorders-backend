const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    variant: {
      type: DataTypes.JSON,
      allowNull: true,
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
