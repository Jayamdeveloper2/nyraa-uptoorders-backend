const Category = require("../models/Category")
const Product = require("../models/Product")
const { Op } = require("sequelize")

// Generate slug from category
const generateSlug = (category) => {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-")
}

// Get all categories with filtering and pagination
exports.getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      status,
      sortBy = "sortOrder",
      sortOrder = "ASC",
      includeProducts = false,
    } = req.query

    const offset = (page - 1) * limit
    const where = {}

    // Apply filters
    if (search) {
      where[Op.or] = [{ category: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    if (status) where.status = status

    const includeOptions = [
      {
        model: Category,
        as: "children",
        attributes: ["id", "category", "cat_slug", "status"],
      },
      {
        model: Category,
        as: "parent",
        attributes: ["id", "category", "cat_slug"],
      },
    ]

    if (includeProducts === "true") {
      includeOptions.push({
        model: Product,
        as: "products",
        attributes: ["id", "category", "price", "image", "status"],
        limit: 5,
      })
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where,
      include: includeOptions,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    // Add product count for each category
    for (const category of categories) {
      const productCount = await Product.count({
        where: { categoryId: category.id },
      })
      category.dataValues.productCount = productCount
    }

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    })
  }
}

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "category", "cat_slug", "status"],
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "category", "cat_slug"],
        },
        {
          model: Product,
          as: "products",
          attributes: ["id", "category", "price", "image", "status"],
          limit: 10,
        },
      ],
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Add product count
    const productCount = await Product.count({
      where: { categoryId: category.id },
    })
    category.dataValues.productCount = productCount

    res.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    })
  }
}

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const {
      category,
      description,
      parentId,
      sortOrder = 0,
      seoTitle,
      seoDescription,
      featured = false,
      status = "active",
    } = req.body

    // Validate required fields
    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      })
    }

    // Check if category with same name already exists (case-insensitive for MySQL)
    const existingCategory = await Category.findOne({
      where: {
        category: {
          [Op.like]: category.trim(),
        },
      },
    })

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      })
    }

    // Generate slug
    const slug = generateSlug(category)

    // Check if slug already exists and make it unique if needed
    let finalSlug = slug
    let counter = 1
    while (await Category.findOne({ where: { cat_slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId)
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        })
      }
    }

    const newCategory = await Category.create({
      category: category.trim(),
      description: description?.trim() || null,
      cat_slug: finalSlug,
      parentId: parentId || null,
      sortOrder: Number.parseInt(sortOrder),
      seoTitle: seoTitle?.trim() || null,
      seoDescription: seoDescription?.trim() || null,
      featured: featured === "true" || featured === true,
      status: status.toLowerCase(),
    })

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    })
  } catch (error) {
    console.error("Error creating category:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    })
  }
}

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Handle boolean fields
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === "true" || updateData.featured === true
    }

    // Handle numeric fields
    if (updateData.sortOrder) {
      updateData.sortOrder = Number.parseInt(updateData.sortOrder)
    }

    // Update slug if category is changed
    if (updateData.category) {
      const newSlug = generateSlug(updateData.category)

      // Check if new slug already exists (excluding current category)
      let finalSlug = newSlug
      let counter = 1
      while (
        await Category.findOne({
          where: {
            cat_slug: finalSlug,
            id: { [Op.ne]: id },
          },
        })
      ) {
        finalSlug = `${newSlug}-${counter}`
        counter++
      }

      updateData.cat_slug = finalSlug // Corrected from updateData.slug to updateData.cat_slug
      updateData.category = updateData.category.trim()
    }

    // Validate parent category if provided
    if (updateData.parentId) {
      const parentCategory = await Category.findByPk(updateData.parentId)
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        })
      }

      // Prevent circular reference
      if (updateData.parentId == id) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be its own parent",
        })
      }
    }

    // Trim text fields
    if (updateData.description) updateData.description = updateData.description.trim()
    if (updateData.seoTitle) updateData.seoTitle = updateData.seoTitle.trim()
    if (updateData.seoDescription) updateData.seoDescription = updateData.seoDescription.trim()

    const [updatedRowsCount] = await Category.update(updateData, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: "parent",
          attributes: ["id", "category", "cat_slug"],
        },
      ],
    })

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    })
  } catch (error) {
    console.error("Error updating category:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    })
  }
}

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: id },
    })

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Please move or delete the products first.`,
      })
    }

    // Check if category has child categories
    const childCount = await Category.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${childCount} child categories. Please delete child categories first.`,
      })
    }

    await category.destroy()

    res.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    })
  }
}

// Get category tree (hierarchical structure)
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        parentId: null,
        status: "active",
      },
      include: [
        {
          model: Category,
          as: "children",
          where: { status: "active" },
          required: false,
          include: [
            {
              model: Category,
              as: "children",
              where: { status: "active" },
              required: false,
            },
          ],
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        [{ model: Category, as: "children" }, "sortOrder", "ASC"],
      ],
    })

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error fetching category tree:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch category tree",
      error: error.message,
    })
  }
}

// Get active categories for dropdown
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: "active" },
      attributes: ["id", "category", "cat_slug"],
      order: [
        ["sortOrder", "ASC"],
        ["category", "ASC"],
      ],
    })

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error fetching active categories:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch active categories",
      error: error.message,
    })
  }
}

// Get category statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await Category.count()
    const activeCategories = await Category.count({ where: { status: "active" } })
    const featuredCategories = await Category.count({ where: { featured: true } })
    const parentCategories = await Category.count({ where: { parentId: null } })

    // Categories with product counts
    const categoriesWithProducts = await Category.findAll({
      attributes: [
        "id",
        "category",
        "status",
        [
          Category.sequelize.literal("(SELECT COUNT(*) FROM products WHERE products.categoryId = Category.id)"),
          "productCount",
        ],
      ],
      order: [[Category.sequelize.literal("productCount"), "DESC"]],
      limit: 10,
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalCategories,
          activeCategories,
          featuredCategories,
          parentCategories,
        },
        categoriesWithProducts,
      },
    })
  } catch (error) {
    console.error("Error fetching category stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch category statistics",
      error: error.message,
    })
  }
}

module.exports = exports