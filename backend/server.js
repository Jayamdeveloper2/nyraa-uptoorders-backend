// Updated server.js file with proper error handling and health check

const express = require("express")
const cors = require("cors")
const sequelize = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const colorRoutes = require("./routes/units/colorRoutes")
const sizeRoutes = require("./routes/units/sizeRoutes")
const orderRoutes = require("./routes/orderRoutes")
const healthRoutes = require("./routes/healthRoutes")
const addressRoutes = require("./routes/addressRoutes")

const Admin = require("./models/Admin")
const User = require("./models/User")
const Product = require("./models/Product")
const Category = require("./models/Category")
const Color = require("./models/units/Color")
const Size = require("./models/units/Size")
const Order = require("./models/Order")
const OrderItem = require("./models/OrderItem")
const OrderStatusHistory = require("./models/OrderStatusHistory")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs")

require("dotenv").config()

// Import and setup associations
const setupAssociations = require("./models/associations")

const app = express()

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running 🚀" })
})

// Create uploads directories if they don't exist
const uploadDirs = ["uploads", "uploads/products", "uploads/avatars"]
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
})

// Middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true,
  }),
)

// Update the static file serving with better caching:
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d", // Cache for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set cache headers for images
      if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        res.set({
          "Cache-Control": "public, max-age=86400", // 24 hours
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        })
      }
    },
  }),
)

// Add a fallback handler for missing images
app.get("/uploads/*", (req, res) => {
  console.log(`Image not found: ${req.path}`)
  // Send a placeholder image or 404
  res.status(404).json({
    success: false,
    message: "Image not found",
    path: req.path,
  })
})

// Health check endpoint (must be first)
app.use("/api/health", healthRoutes)

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Order API is working",
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api", colorRoutes)
app.use("/api", sizeRoutes)
app.use("/api/orders", orderRoutes) // Fixed: Use /api/orders prefix
app.use("/api/addresses", addressRoutes)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connection established successfully.")
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error)
    process.exit(1)
  }
}

const PORT = process.env.PORT || 5000

async function startServer() {
  await testConnection()

  try {
    // Setup model associations before syncing
    setupAssociations()

    // Sync database with force: false to preserve data
    await sequelize.sync({ force: false, alter: false })
    console.log("✅ Database synchronized successfully")

    // Create default admin user if it doesn't exist
    const existingAdmin = await Admin.findOne({ where: { email: "admin@nyraa.com" } })
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await Admin.create({
        username: "admin",
        email: "admin@nyraa.com",
        password: hashedPassword,
        name: "Administrator",
        phone: "+91 98765 43210",
        department: "Administration",
        avatar: "",
        joinDate: new Date().toISOString().split("T")[0],
        role: "Administrator",
      })

      console.log("✅ Default admin user created")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 Server URL: http://localhost:${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`)
      console.log(`🔐 Default Admin Credentials:`)
      console.log(`   Username: admin`)
      console.log(`   Password: admin123`)
      console.log(`📋 Available order endpoints:`)
      console.log(`   POST /api/orders - Create order`)
      console.log(`   GET  /api/orders - Get user orders`)
      console.log(`   GET  /api/orders/:id - Get single order`)
      console.log(`   PATCH /api/orders/:id/status - Update order status`)
      console.log(`   GET  /api/orders/admin/stats - Get order statistics`)
    })
  } catch (error) {
    console.error("❌ Server startup error:", error)
    process.exit(1)
  }
}

// Handle 404 routes
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

startServer()

module.exports = app
