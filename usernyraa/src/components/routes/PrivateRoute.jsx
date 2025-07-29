import { Navigate } from "react-router-dom"

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token")
  const userData = JSON.parse(localStorage.getItem("userData") || "{}")

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if profile is complete for cart/checkout access
  const isProfileComplete =
    userData.name && userData.name.trim() !== "" && userData.phone && userData.phone.trim() !== ""

  // If accessing cart or checkout and profile is incomplete, redirect to profile
  const currentPath = window.location.pathname
  if ((currentPath.includes("/cart") || currentPath.includes("/checkout")) && !isProfileComplete) {
    return <Navigate to="/account/profile?complete=true" replace />
  }

  return children
}

export default PrivateRoute
