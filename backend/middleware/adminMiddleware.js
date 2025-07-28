module.exports = (req, res, next) => {
  if (req.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
  next()
}
