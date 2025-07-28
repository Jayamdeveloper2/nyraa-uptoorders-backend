const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")
const Category = require("./Category")

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cat_slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    style: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    availability: {
      type: DataTypes.ENUM("in_stock", "out_of_stock", "pre_order", "discontinued"),
      defaultValue: "in_stock",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "draft"),
      defaultValue: "active",
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metaKeywords: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    variants: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidVariants(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Variants must be a non-empty array")
          }
          value.forEach((variant, index) => {
            if (!variant.color || typeof variant.color !== "string") {
              throw new Error(`Variant at index ${index} must have a valid color`)
            }
            if (!variant.size || typeof variant.size !== "string") {
              throw new Error(`Variant at index ${index} must have a valid size`)
            }
            if (!variant.type || typeof variant.type !== "string") {
              throw new Error(`Variant at index ${index} must have a valid type`)
            }
            if (variant.price == null || isNaN(Number.parseFloat(variant.price))) {
              throw new Error(`Variant at index ${index} must have a valid price`)
            }
            if (
              variant.quantity === undefined ||
              variant.quantity === null ||
              isNaN(Number.parseInt(variant.quantity))
            ) {
              throw new Error(`Variant at index ${index} must have a valid quantity`)
            }
          })
        },
      },
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidSpecifications(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Specifications must be a non-empty array")
          }
          value.forEach((spec, index) => {
            if (!spec.Fabric || typeof spec.Fabric !== "string") {
              throw new Error(`Specification at index ${index} must have a valid Fabric`)
            }
          })
        },
      },
    },
    shippingInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    returnPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    salesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastStockUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    indexes: [
      { fields: ["slug"] },
      { fields: ["cat_slug"] },
      { fields: ["categoryId"] },
      { fields: ["brand"] },
      { fields: ["status"] },
      { fields: ["featured"] },
      { fields: ["rating"] },
      { fields: ["availability"] },
    ],
  }
)

// Define association
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" })

module.exports = Product