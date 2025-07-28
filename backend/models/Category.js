const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,

      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cat_slug: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
    },
    sortOrder: {
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
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    indexes: [
      { fields: ["cat_slug"] },
      { fields: ["status"] },
      { fields: ["parentId"] },
      { fields: ["featured"] },
      { fields: ["sortOrder"] },
      { fields: ["name"] },
    ],
  },
)

// Self-referencing association for parent-child categories
Category.hasMany(Category, { as: "children", foreignKey: "parentId" })
Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" })

module.exports = Category
