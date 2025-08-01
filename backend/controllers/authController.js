const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")
const nodemailer = require("nodemailer")
const { Op } = require("sequelize")
const Admin = require("../models/Admin")
const User = require("../models/User")

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Normalize email helper
const normalizeEmail = (email) => {
  return email ? email.toLowerCase().trim() : null
}

// Check if user profile is complete
const isProfileComplete = (user) => {
  return user.name && user.name.trim() !== "" && user.phone && user.phone.trim() !== ""
}

// Admin Login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body
  try {
    const admin = await Admin.findOne({ where: { username } })
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    await admin.update({ lastLogin: new Date() })

    const token = jwt.sign({ id: admin.id, type: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "14d",
    })

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name || "",
        role: admin.role,
        avatar: admin.avatar || "",
        phone: admin.phone || "",
        department: admin.department || "",
        joinDate: admin.joinDate || null,
        type: "admin",
      },
    })
  } catch (error) {
    console.error("Error during admin login:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// User Login (Email + Password)
exports.userLogin = async (req, res) => {
  const { email, password } = req.body
  try {
    const normalizedEmail = normalizeEmail(email)
    const user = await User.findOne({ where: { email: normalizedEmail } })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (user.provider === "google") {
      return res.status(400).json({ message: "Please use Google login for this account" })
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please set a password for your account or use OTP login" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, type: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        joinDate: user.joinDate || null,
        avatar: user.avatar || "",
        role: user.role,
        type: "user",
        profileComplete: isProfileComplete(user),
      },
    })
  } catch (error) {
    console.error("Error during user login:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Combined login endpoint (checks both admin and user)
exports.login = async (req, res) => {
  const { username, email, password } = req.body

  try {
    if (username) {
      // Admin login
      return exports.adminLogin(req, res)
    } else if (email) {
      // User login
      return exports.userLogin(req, res)
    } else {
      return res.status(400).json({ message: "Username or email required" })
    }
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Send OTP for login (creates user if doesn't exist)
exports.sendOTP = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  try {
    const normalizedEmail = normalizeEmail(email)
    let user = await User.findOne({ where: { email: normalizedEmail } })

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: "", // Empty name to indicate incomplete profile
        role: "user",
        joinDate: new Date().toISOString().split("T")[0],
        provider: "email", // Mark as email-based account
        status: "Active",
      })
      console.log("Created new user:", user.email)
    }

    // Check if it's a Google account
    if (user.provider === "google") {
      return res.status(400).json({ message: "Google accounts cannot use OTP login. Please use Google Sign-In." })
    }

    const otp = generateOTP()
    user.otp = otp
    user.otpExpires = Date.now() + 10 * 60 * 1000 // OTP valid for 10 minutes
    await user.save()

    console.log(`Generated OTP for ${normalizedEmail}: ${otp}`)

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

      const mailOptions = {
  from: `"Nyraa" <${process.env.EMAIL_USER}>`, 
  to: normalizedEmail,
  subject: "Your OTP for Login",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Login OTP</h2>
      <p>Hello,</p>
      <p>Your OTP for login is:</p>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
    </div>
  `,
}


        await transporter.sendMail(mailOptions)
        console.log(`OTP email sent to ${normalizedEmail}`)
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.log(`EMAIL NOT CONFIGURED - OTP for ${normalizedEmail}: ${otp}`)
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email: normalizedEmail,
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    res.status(500).json({ message: "Failed to send OTP" })
  }
}

// Verify OTP and login user
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" })
  }

  try {
    const normalizedEmail = normalizeEmail(email)
    const user = await User.findOne({ where: { email: normalizedEmail } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP found. Please request a new OTP." })
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." })
    }

    // Clear OTP and mark as verified
    user.otp = null
    user.otpExpires = null
    user.isVerified = true
    await user.save()

    // Generate JWT token for automatic login
    const token = jwt.sign({ id: user.id, type: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        joinDate: user.joinDate || null,
        avatar: user.avatar || "",
        role: user.role,
        type: "user",
        profileComplete: isProfileComplete(user),
      },
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Google Login
exports.googleLogin = async (req, res) => {
  const { token } = req.body
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    const normalizedEmail = normalizeEmail(email)
    let user = await User.findOne({ where: { email: normalizedEmail } })
    let isNewUser = false

    if (!user) {
      // New user
      isNewUser = true
      user = await User.create({
        email: normalizedEmail,
        name: name || "",
        avatar: picture || "",
        role: "user",
        joinDate: new Date().toISOString().split("T")[0],
        provider: "google",
        isVerified: true,
        status: "Active",
      })
    } else {
      // Existing user - update info if needed
      let needsUpdate = false
      if (!user.provider || user.provider !== "google") {
        user.provider = "google"
        needsUpdate = true
      }
      if (name && user.name !== name) {
        user.name = name
        needsUpdate = true
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture
        needsUpdate = true
      }
      if (!user.isVerified) {
        user.isVerified = true
        needsUpdate = true
      }
      if (needsUpdate) {
        await user.save()
      }
    }

    const jwtToken = jwt.sign({ id: user.id, type: "user" }, process.env.JWT_SECRET, { 
      expiresIn: "16d",
    })

    res.json({
      success: true,
      token: jwtToken,
      isNewUser: isNewUser || !isProfileComplete(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        joinDate: user.joinDate || null,
        avatar: user.avatar || "",
        role: user.role,
        type: "user",
        profileComplete: isProfileComplete(user),
      },
    })
  } catch (error) {
    console.error("Error during Google login:", error)
    res.status(401).json({ message: "Google authentication failed" })
  }
}

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user
    if (req.userType === "admin") {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || "",
        role: user.role,
        avatar: user.avatar || "",
        phone: user.phone || "",
        department: user.department || "",
        joinDate: user.joinDate || null,
        type: "admin",
      })
    } else {
      res.json({
        id: user.id,
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        joinDate: user.joinDate || null,
        avatar: user.avatar || "",
        role: user.role,
        type: "user",
        profileComplete: isProfileComplete(user),
      })
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, email, phone, joinDate, department } = req.body
  try {
    const user = req.user

    // Check if phone number already exists for another user
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({
        where: {
          phone: phone.trim(),
          id: { [Op.ne]: user.id }, // Exclude current user
        },
      })

      if (existingUser) {
        return res.status(400).json({ message: "This phone number is already registered with another account" })
      }
    }

    if (req.userType === "admin") {
      user.name = name !== undefined ? name : user.name
      user.email = email !== undefined ? normalizeEmail(email) : user.email
      user.phone = phone !== undefined ? phone : user.phone
      user.department = department !== undefined ? department : user.department
      user.joinDate = joinDate !== undefined ? joinDate : user.joinDate
      await user.save()
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || "",
        role: user.role,
        avatar: user.avatar || "",
        phone: user.phone || "",
        department: user.department || "",
        joinDate: user.joinDate || null,
        type: "admin",
      })
    } else {
      user.name = name !== undefined ? name : user.name
      user.email = email !== undefined ? normalizeEmail(email) : user.email
      user.phone = phone !== undefined ? phone : user.phone
      user.joinDate = joinDate !== undefined ? joinDate : user.joinDate
      await user.save()
      res.json({
        id: user.id,
        email: user.email,
        name: user.name || "",
        phone: user.phone || "",
        joinDate: user.joinDate || null,
        avatar: user.avatar || "",
        role: user.role,
        type: "user",
        profileComplete: isProfileComplete(user),
      })
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, password } = req.body
  try {
    const user = req.user
    if (user.provider === "google") {
      return res.status(400).json({ message: "Google accounts cannot change password here" })
    }

    if (!user.password) {
      // User doesn't have a password set (OTP-only account)
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
      await user.save()
      return res.status(200).json({ message: "Password set successfully." })
    }

    const isAuth = await bcrypt.compare(currentPassword, user.password)
    if (!isAuth) {
      return res.status(400).json({ message: "Incorrect current password." })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    user.password = hashedPassword
    await user.save()
    return res.status(200).json({ message: "Password successfully changed." })
  } catch (error) {
    console.error("Error changing password:", error)
    return res.status(400).json({ message: error.message })
  }
}

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const user = req.user
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }
    const avatar = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`
    user.avatar = avatar
    await user.save()
    res.json({
      success: true,
      user: {
        id: user.id,
        username: req.userType === "admin" ? user.username : undefined,
        email: user.email,
        name: user.name || "",
        role: user.role,
        avatar: user.avatar || "",
        phone: user.phone || "",
        department: req.userType === "admin" ? user.department || "" : undefined,
        joinDate: user.joinDate || null,
        type: req.userType,
        profileComplete: req.userType === "user" ? isProfileComplete(user) : undefined,
      },
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = exports
