const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const OrderStatusHistory = sequelize.define(
  "OrderStatusHistory",
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
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changedBy: {
      type: DataTypes.STRING,
      defaultValue: "system",
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "order_status_history",
    timestamps: true,
    indexes: [
      {
        fields: ["orderId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["changedAt"],
      },
    ],
  },
)

module.exports = OrderStatusHistory
