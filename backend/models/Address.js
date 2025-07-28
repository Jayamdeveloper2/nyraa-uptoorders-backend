const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is required",
        },
        len: {
          args: [2, 255],
          msg: "Name must be between 2 and 255 characters",
        },
      },
    },
    street: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Street address is required",
        },
      },
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "City is required",
        },
        len: {
          args: [2, 100],
          msg: "City must be between 2 and 100 characters",
        },
      },
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "State is required",
        },
        len: {
          args: [2, 100],
          msg: "State must be between 2 and 100 characters",
        },
      },
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "ZIP code is required",
        },
        len: {
          args: [3, 20],
          msg: "ZIP code must be between 3 and 20 characters",
        },
      },
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "United States",
      validate: {
        notEmpty: {
          msg: "Country is required",
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Phone number is required",
        },
        len: {
          args: [10, 20],
          msg: "Phone number must be between 10 and 20 characters",
        },
      },
    },
    type: {
      type: DataTypes.ENUM("home", "work", "other"),
      defaultValue: "home",
      validate: {
        isIn: {
          args: [["home", "work", "other"]],
          msg: "Type must be home, work, or other",
        },
      },
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "isDefault"],
      },
      {
        fields: ["type"],
      },
    ],
    hooks: {
      beforeCreate: async (address, options) => {
        // If this is being set as default, unset other defaults for this user
        if (address.isDefault) {
          await Address.update(
            { isDefault: false },
            {
              where: {
                userId: address.userId,
                isDefault: true,
              },
              transaction: options.transaction,
            },
          )
        }
      },
      beforeUpdate: async (address, options) => {
        // If this is being set as default, unset other defaults for this user
        if (address.isDefault && address.changed("isDefault")) {
          await Address.update(
            { isDefault: false },
            {
              where: {
                userId: address.userId,
                isDefault: true,
                id: { [require("sequelize").Op.ne]: address.id },
              },
              transaction: options.transaction,
            },
          )
        }
      },
    },
  },
)

module.exports = Address
