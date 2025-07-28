

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("userData")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      } catch (error) {
        console.error("Error parsing user data:", error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/admin/login", {
        username,
        password,
      })

      if (response.data.success) {
        const { token, user: userData } = response.data

        // Store in localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("isLoggedIn", "true")

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Update state
        setUser(userData)
        setIsAuthenticated(true)

        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    localStorage.removeItem("isLoggedIn")

    // Clear axios default header
    delete axios.defaults.headers.common["Authorization"]

    // Update state
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put("http://localhost:5000/api/auth/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const updatedUser = response.data
      setUser(updatedUser)
      localStorage.setItem("userData", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const uploadProfileImage = async (file) => {
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await axios.post("http://localhost:5000/api/auth/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem("userData", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      console.error("Upload image error:", error)
      throw error
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword,
          password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      return response.data
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    uploadProfileImage,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
