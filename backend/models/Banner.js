const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    buttonText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.ENUM("hero", "secondary", "sidebar", "footer"),
      defaultValue: "hero",
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Scheduled"),
      defaultValue: "Active",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clickCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    targetAudience: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["position"],
      },
      {
        fields: ["sortOrder"],
      },
      {
        fields: ["startDate", "endDate"],
      },
    ],
  },
)

module.exports = Banner
