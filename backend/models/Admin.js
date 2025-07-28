const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Add unique constraint
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
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "Administrator",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "admins",
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ["email"], unique: true }, { fields: ["username"], unique: true }, { fields: ["status"] }],
    hooks: {
      beforeSave: (admin) => {
        // Normalize email to lowercase
        if (admin.email) {
          admin.email = admin.email.toLowerCase().trim()
        }
        if (admin.username) {
          admin.username = admin.username.toLowerCase().trim()
        }
      },
      beforeCreate: (admin) => {
        // Set default join date
        if (!admin.joinDate) {
          admin.joinDate = new Date().toISOString().split("T")[0]
        }
      },
    },
  },
)

module.exports = Admin
