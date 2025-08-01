const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const User = require("../models/User")

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    let user

    if (decoded.type === "admin") {
      user = await Admin.findByPk(decoded.id)
      req.userType = "admin"
    } else {
      user = await User.findByPk(decoded.id)
      req.userType = "user"
    }

    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" })
    }

    // Check if user is active
    if (user.status && user.status !== "Active") {
      return res.status(401).json({ message: "Account is inactive" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }
    res.status(401).json({ message: "Invalid token" })
  }
}
