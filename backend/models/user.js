const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Add unique constraint
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "", // Add default value
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Add email verification status
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Blocked"),
      defaultValue: "Active",
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },
    addresses: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    referralCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastOrderDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["email"], unique: true },
      { fields: ["phone"] },
      { fields: ["status"] },
      { fields: ["totalSpent"] },
      { fields: ["lastOrderDate"] },
    ],
    hooks: {
      beforeSave: (user) => {
        // Normalize email to lowercase
        if (user.email) {
          user.email = user.email.toLowerCase().trim()
        }
      },
      beforeCreate: (user) => {
        // Set default join date
        if (!user.joinDate) {
          user.joinDate = new Date().toISOString().split("T")[0]
        }
        // Set default name from email if not provided
        if (!user.name && user.email) {
          user.name = user.email.split("@")[0]
        }
      },
    },
  },
)

module.exports = User
