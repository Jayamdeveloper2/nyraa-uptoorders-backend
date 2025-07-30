// Utility functions for user data management
export const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")
    if (!token) return null

    // Simple JWT decode (without verification since we don't have the secret on frontend)
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)
    return decoded?.id || null
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

export const getCurrentUserData = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")
    if (!token) return null

    // Simple JWT decode
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)
    return decoded || null
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

export const isAuthenticated = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken")
  if (!token) return false

  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)
    if (!decoded || !decoded.exp) return false

    // Check if token is expired
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export const getUserType = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")
    if (!token) return null

    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)
    return decoded?.type || "user"
  } catch (error) {
    console.error("Error getting user type:", error)
    return null
  }
}

export const clearAuthData = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("authToken")
  localStorage.removeItem("userData")
  localStorage.removeItem("userId")
}
