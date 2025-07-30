const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  console.log("=== AUTH MIDDLEWARE DEBUG ===")
  console.log("Headers:", req.headers)
  console.log("Authorization header:", req.headers.authorization)

  // Get token from header
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader) {
    // Handle both "Bearer token" and just "token" formats
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      token = authHeader
    }
  }

  console.log("Extracted token:", token ? token.substring(0, 20) + "..." : "No token")

  if (!token) {
    console.log("No token provided")
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    })
  }

  try {
    // Make sure you have the correct JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key"
    console.log("Using JWT secret:", JWT_SECRET ? "Secret found" : "No secret")

    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("Decoded token payload:", decoded)

    // Set user information in request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      type: decoded.type || "user",
    }

    req.userType = decoded.type || "user"

    console.log("User set in request:", req.user)
    console.log("User type:", req.userType)
    console.log("=== AUTH MIDDLEWARE SUCCESS ===")

    next()
  } catch (error) {
    console.error("JWT verification failed:", error.message)
    console.error("Error details:", error)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      })
    } else {
      return res.status(401).json({
        success: false,
        message: "Token verification failed.",
      })
    }
  }
}

module.exports = authMiddleware
