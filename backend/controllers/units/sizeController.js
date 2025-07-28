const Size = require("../../models/units/Size")

// Get all sizes
const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll()
    res.json({
      success: true,
      data: sizes,
    })
  } catch (error) {
    console.error("Error fetching sizes:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch sizes",
      error: error.message,
    })
  }
}

// Create new size
const createSize = async (req, res) => {
  try {
    const { name, isActive } = req.body
    const size = await Size.create({ name, isActive: isActive === "true" || isActive === true })
    res.status(201).json({
      success: true,
      message: "Size created successfully",
      data: size,
    })
  } catch (error) {
    console.error("Error creating size:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create size",
      error: error.message,
    })
  }
}

// Update size
const updateSize = async (req, res) => {
  try {
    const { id } = req.params
    const { name, isActive } = req.body
    const size = await Size.findByPk(id)
    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      })
    }
    await size.update({ name, isActive: isActive === "true" || isActive === true })
    res.json({
      success: true,
      message: "Size updated successfully",
      data: size,
    })
  } catch (error) {
    console.error("Error updating size:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update size",
      error: error.message,
    })
  }
}

// Delete size
const deleteSize = async (req, res) => {
  try {
    const { id } = req.params
    const size = await Size.findByPk(id)
    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      })
    }
    await size.destroy()
    res.json({
      success: true,
      message: "Size deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting size:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete size",
      error: error.message,
    })
  }
}

module.exports = {
  getAllSizes,
  createSize,
  updateSize,
  deleteSize,
}