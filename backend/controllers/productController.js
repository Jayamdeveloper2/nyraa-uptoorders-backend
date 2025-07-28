const Product = require("../models/Product")
const Category = require("../models/Category")
const { Op } = require("sequelize")
const path = require("path")
const fs = require("fs")

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// Get all products with filtering, sorting, and pagination
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      availability,
      status, 
      featured,
      sortBy = "createdAt",
      sortOrder = "DESC",
      size,
      material,
      style,
      color,
    } = req.query

    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const where = {}

    if (status) {
      where.status = status || "active";

    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
      ]
    }

    if (category) {
      const isNumeric = /^\d+$/.test(category)
      if (isNumeric) {
        where.categoryId = category
      } else {
        where.cat_slug = category
      }
    }

    if (brand) where.brand = brand
    if (availability) where.availability = availability
    if (featured !== undefined) where.featured = featured === "true"
    if (size) where.size = { [Op.like]: `%${size}%` }
    if (material) where.material = material
    if (style) where.style = style

    const variantConditions = []
    if (color) {
      variantConditions.push(
        Product.sequelize.where(Product.sequelize.json("variants.color"), { [Op.like]: `%${color}%` }),
      )
    }
    if (size) {
      variantConditions.push(
        Product.sequelize.where(Product.sequelize.json("variants.size"), { [Op.like]: `%${size}%` }),
      )
    }
    if (minPrice || maxPrice) {
      const priceCondition = {}
      if (minPrice) priceCondition[Op.gte] = Number.parseFloat(minPrice)
      if (maxPrice) priceCondition[Op.lte] = Number.parseFloat(maxPrice)
      variantConditions.push(Product.sequelize.where(Product.sequelize.json("variants.price"), priceCondition))
    }
    if (variantConditions.length > 0) {
      where[Op.and] = variantConditions
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: Number.parseInt(limit),
      offset,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category", "cat_slug"],
          required: false,
        },
      ],
    })

    const transformedProducts = products.map((product) => {
      const productData = product.toJSON()
      productData.images = Array.isArray(productData.images)
        ? productData.images.map((img) =>
            img.startsWith("http") ? img : `${req.protocol}://${req.get("host")}/${img}`,
          )
        : []
      productData.image = productData.images[0] || null
      if (productData.secondaryImage) {
        productData.secondaryImage = productData.secondaryImage.startsWith("http")
          ? productData.secondaryImage
          : `${req.protocol}://${req.get("host")}/${productData.secondaryImage}`
      }

      if (productData.category) {
        productData.cat_slug = productData.category.cat_slug || productData.cat_slug
        productData.categoryName = productData.category.category
      }

      return productData
    })

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / Number.parseInt(limit)),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
}

// Get single product by ID or slug
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const isNumeric = /^\d+$/.test(id)

    const product = await Product.findOne({
      where: isNumeric ? { id } : { slug: id },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category", "cat_slug"],
          required: false,
        },
      ],
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const productData = product.toJSON()
    productData.images = Array.isArray(productData.images)
      ? productData.images.map((img) => (img.startsWith("http") ? img : `${req.protocol}://${req.get("host")}/${img}`))
      : []
    productData.image = productData.images[0] || null
    if (productData.secondaryImage) {
      productData.secondaryImage = productData.secondaryImage.startsWith("http")
        ? productData.secondaryImage
        : `${req.protocol}://${req.get("host")}/${productData.secondaryImage}`
    }

    if (productData.category) {
      productData.cat_slug = productData.category.cat_slug || productData.cat_slug
      productData.categoryName = productData.category.category
    }

    await product.increment("viewCount")

    res.json({
      success: true,
      data: productData,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    })
  }
}

// Create new product with image upload
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body }

    // Validate required fields
    if (!productData.name || !productData.categoryId || !productData.variants || !productData.specifications) {
      return res.status(400).json({
        success: false,
        message: "Name, categoryId, variants, specifications, and quantity are required",
      })
    }

    // Validate and fetch category
    const category = await Category.findByPk(productData.categoryId)
    if (!category || !category.category) {
      console.error("Category not found or invalid for categoryId:", productData.categoryId)
      return res.status(400).json({
        success: false,
        message: `Invalid or missing category for categoryId: ${productData.categoryId}`,
      })
    }

    productData.cat_slug = category.cat_slug

    productData.slug = productData.slug || generateSlug(productData.name)

    const existingSlug = await Product.findOne({ where: { slug: productData.slug } })
    if (existingSlug) {
      productData.slug = `${productData.slug}-${Date.now()}`
    }

    productData.images = []
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      productData.images = req.files.map((file) => `uploads/products/${file.filename}`)
      productData.image = productData.images[0]
      if (productData.images.length > 1) {
        productData.secondaryImage = productData.images[1]
      }
    }

    if (typeof productData.variants === "string") {
      try {
        productData.variants = JSON.parse(productData.variants)
      } catch (e) {
        console.error("Error parsing variants:", e)
        return res.status(400).json({
          success: false,
          message: "Invalid variants format",
        })
      }
    }

    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Variants must be a non-empty array",
      })
    }

    productData.variants = productData.variants.map((variant) => ({
      color: variant.color,
      size: variant.size,
      type: variant.type,
      price: Number.parseFloat(variant.price),
      originalPrice: variant.originalPrice ? Number.parseFloat(variant.originalPrice) : null,
      quantity: Number.parseInt(variant.quantity) || 0,
    }))

    if (productData.variants.some((v) => !v.color || !v.size || !v.type || isNaN(v.price) || isNaN(v.quantity) || v.quantity < 0)) {
      return res.status(400).json({
        success: false,
        message: "All variants must have a valid color, size, type, price, and non-negative quantity",
      })
    }

    if (typeof productData.specifications === "string") {
      try {
        productData.specifications = JSON.parse(productData.specifications)
      } catch (e) {
        console.error("Error parsing specifications:", e)
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        })
      }
    }

    if (!Array.isArray(productData.specifications) || productData.specifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Specifications must be a non-empty array",
      })
    }

    productData.specifications = productData.specifications.map((spec) => ({
      Fabric: spec.value,
    }))

    if (productData.specifications.some((s) => !s.Fabric)) {
      return res.status(400).json({
        success: false,
        message: "All specifications must have a valid Fabric",
      })
    }

    productData.seoTitle = productData.metaTitle || productData.seoTitle
    productData.metaKeywords = productData.keywords || productData.metaKeywords
    delete productData.metaTitle
    delete productData.keywords

    productData.featured = productData.featured === "true" || productData.featured === true

 

    const product = await Product.create(productData)

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.join(__dirname, "..", file.path)
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err)
        })
      })
    }
    res.status(500).json({
      success: false,
      message: `Failed to create product: ${error.message}`,
    })
  }
}

// Update product with image upload
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    const product = await Product.findByPk(id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId)
      if (!category || !category.category) {
        console.error("Category not found or invalid for categoryId:", updateData.categoryId)
        return res.status(400).json({
          success: false,
          message: `Invalid or missing category for categoryId: ${updateData.categoryId}`,
        })
      }
      updateData.cat_slug = category.cat_slug
    }

    if (req.files && req.files.length > 0) {
      updateData.images  = req.files.map((file) => `uploads/products/${file.filename}`)
      updateData.image = updateData.images[0]
      updateData.secondaryImage = updateData.images[1] || null

      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "..", imagePath)
          if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
              if (err) console.error("Error deleting old image:", err)
            })
          }
        })
      }
    } else if (updateData.existingImages) {
      try {
        updateData.images = JSON.parse(updateData.existingImages)
        updateData.image = updateData.images[0] || null
        updateData.secondaryImage = updateData.images[1] || null
      } catch (e) {
        console.error("Error parsing existingImages:", e)
        return res.status(400).json({
          success: false,
          message: "Invalid existingImages format",
        })
      }
    }

    if (typeof updateData.variants === "string") {
      try {
        updateData.variants = JSON.parse(updateData.variants)
      } catch (e) {
        console.error("Error parsing variants:", e)
        return res.status(400).json({
          success: false,
          message: "Invalid variants format",
        })
      }
    }

    if (!Array.isArray(updateData.variants) || updateData.variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Variants must be a non-empty array",
      })
    }

    updateData.variants = updateData.variants.map((variant) => ({
      color: variant.color,
      size: variant.size,
      type: variant.type,
      price: Number.parseFloat(variant.price),
      originalPrice: variant.originalPrice ? Number.parseFloat(variant.originalPrice) : null,
      quantity: Number.parseInt(variant.quantity) || 0,
    }))

    if (updateData.variants.some((v) => !v.color || !v.size || !v.type || isNaN(v.price) || isNaN(v.quantity) || v.quantity < 0)) {
      return res.status(400).json({
        success: false,
        message: "All variants must have a valid color, size, type, price, and non-negative quantity",
      })
    }

    if (typeof updateData.specifications === "string") {
      try {
        updateData.specifications = JSON.parse(updateData.specifications)
      } catch (e) {
        console.error("Error parsing specifications:", e)
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        })
      }
    }

    if (!Array.isArray(updateData.specifications) || updateData.specifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Specifications must be a non-empty array",
      })
    }

    updateData.specifications = updateData.specifications.map((spec) => ({
      Fabric: spec.value,
    }))

    if (updateData.specifications.some((s) => !s.Fabric)) {
      return res.status(400).json({
        success: false,
        message: "All specifications must have a valid Fabric",
      })
    }

    if (updateData.name && updateData.name !== product.name) {
      const newSlug = generateSlug(updateData.name)
      const existingSlug = await Product.findOne({
        where: { slug: newSlug, id: { [Op.ne]: id } },
      })
      updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug
    }

    updateData.seoTitle = updateData.metaTitle || updateData.seoTitle
    updateData.metaKeywords = updateData.keywords || updateData.metaKeywords
    delete updateData.metaTitle
    delete updateData.keywords

    updateData.featured = updateData.featured === "true" || updateData.featured === true

 

  

    await product.update(updateData)

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.join(__dirname, "..", file.path)
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err)
        })
      })
    }
    res.status(500).json({
      success: false,
      message: `Failed to update product: ${error.message}`,
    })
  }
}

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findByPk(id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath)
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error("Error deleting image:", err)
          })
        }
      })
    }

    await product.destroy()

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    })
  }
}

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      })
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { brand: { [Op.like]: `%${q}%` } },
          { cat_slug: { [Op.like]: `%${q}%` } },
        ],
        status: "active",
      },
      limit: Number.parseInt(limit),
      attributes: ["id", "name", "slug", "brand", "cat_slug", "images", "variants", "specifications"],
      order: [["salesCount", "DESC"]],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category", "cat_slug"],
          required: false,
        },
      ],
    })

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Error searching products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to search products",
      error: error.message,
    })
  }
}

// Get product statistics
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.count()
    const activeProducts = await Product.count({ where: { status: "active" } })
    const outOfStockProducts = await Product.count({ where: { availability: "out_of_stock" } })
    const featuredProducts = await Product.count({ where: { featured: true } })

    const lowStockProducts = await Product.count({
      where: {
        quantity: { [Op.lte]: Product.sequelize.col("lowStockThreshold") },
      },
    })

    const topSellingProducts = await Product.findAll({
      order: [["salesCount", "DESC"]],
      limit: 10,
      attributes: ["id", "name", "salesCount", "images"],
    })

    const productsByCategory = await Product.findAll({
      attributes: ["cat_slug", [Product.sequelize.fn("COUNT", Product.sequelize.col("id")), "count"]],
      group: ["cat_slug"],
      order: [[Product.sequelize.literal("count"), "DESC"]],
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          outOfStockProducts,
          featuredProducts,
          lowStockProducts,
        },
        topSellingProducts,
        productsByCategory,
      },
    })
  } catch (error) {
    console.error("Error fetching product stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product statistics",
      error: error.message,
    })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
}