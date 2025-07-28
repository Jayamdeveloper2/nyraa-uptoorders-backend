const User = require("./User")
const Product = require("./Product")
const Order = require("./Order")
const OrderItem = require("./OrderItem")
const OrderStatusHistory = require("./OrderStatusHistory")
const Address = require("./Address") // Add this line

// Define associations
const setupAssociations = () => {
  // User - Order associations
  User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  Order.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })

 // Change the association name from 'addresses' to something like 'userAddresses'
User.hasMany(Address, {
  foreignKey: "userId",
  as: "userAddresses",  // Changed from "addresses"
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

  // Order - OrderItem associations
  Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  OrderItem.belongsTo(Order, { 
    foreignKey: "orderId",
    as: "order",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })

  // Product - OrderItem associations
  Product.hasMany(OrderItem, {
    foreignKey: "productId",
    as: "orderItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  OrderItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })

  // Order - OrderStatusHistory associations
  Order.hasMany(OrderStatusHistory, {
    foreignKey: "orderId",
    as: "statusHistory",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  OrderStatusHistory.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })

  console.log("✅ Model associations set up successfully")
}

module.exports = setupAssociations
