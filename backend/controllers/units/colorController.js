const Color = require("../../models/units/Color")
const { Op } = require("sequelize")

// Get all colors, sorted by sortOrder
const getAllColors = async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    })
    res.json({
      success: true,
      data: colors,
    })
  } catch (error) {
    console.error("Error fetching colors:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch colors",
      error: error.message,
    })
  }
}

// Create new color
const createColor = async (req, res) => {
  try {
    const { name, isActive, sortOrder } = req.body
    const parsedSortOrder = parseInt(sortOrder) || 0

    // Check for sortOrder conflict
    const existingColor = await Color.findOne({ where: { sortOrder: parsedSortOrder } })
    if (existingColor) {
      // Swap sortOrder or assign max(sortOrder) + 1 (using max for creation to avoid conflicts)
      const maxSortOrder = await Color.max('sortOrder') || 0
      await existingColor.update({ sortOrder: maxSortOrder + 1 })
    }

    const color = await Color.create({
      name,
      isActive: isActive === "true" || isActive === true,
      sortOrder: parsedSortOrder,
    })

    // Fetch updated color list
    const updatedColors = await Color.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    })

    res.status(201).json({
      success: true,
      message: existingColor ? `Color created successfully, reassigned sortOrder for ${existingColor.name} to ${existingColor.sortOrder}` : "Color created successfully",
      data: color,
      updatedColors,
    })
  } catch (error) {
    console.error("Error creating color:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create color",
      error: error.message,
    })
  }
}

// Update color
const updateColor = async (req, res) => {
  try {
    const { id } = req.params
    const { name, isActive, sortOrder } = req.body
    const parsedSortOrder = parseInt(sortOrder) || 0

    const color = await Color.findByPk(id)
    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      })
    }

    // Check for sortOrder conflict with other colors
    const existingColor = await Color.findOne({
      where: {
        sortOrder: parsedSortOrder,
        id: { [Op.ne]: id },
      },
    })

    let message = "Color updated successfully"
    if (existingColor) {
      // Swap sortOrder values
      const currentSortOrder = color.sortOrder
      await existingColor.update({ sortOrder: currentSortOrder })
      message = `Color updated successfully, swapped sortOrder with ${existingColor.name} to ${currentSortOrder}`
    }

    await color.update({
      name: name || color.name,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : color.isActive,
      sortOrder: parsedSortOrder !== undefined ? parsedSortOrder : color.sortOrder,
    })

    // Fetch updated color list
    const updatedColors = await Color.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    })

    res.json({
      success: true,
      message,
      data: color,
      updatedColors,
    })
  } catch (error) {
    console.error("Error updating color:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update color",
      error: error.message,
    })
  }
}

// Delete color
const deleteColor = async (req, res) => {
  try {
    const { id } = req.params
    const color = await Color.findByPk(id)
    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      })
    }
    await color.destroy()

    // Fetch updated color list
    const updatedColors = await Color.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    })

    res.json({
      success: true,
      message: "Color deleted successfully",
      updatedColors,
    })
  } catch (error) {
    console.error("Error deleting color:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete color",
      error: error.message,
    })
  }
}

module.exports = {
  getAllColors,
  createColor,
  updateColor,
  deleteColor,
}