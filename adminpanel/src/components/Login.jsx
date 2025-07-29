
import { useState } from "react"
import { ShoppingBag, Eye, EyeOff, Lock, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/admin/login", {
        username: username,
        password: password,
      })

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        addToast("Login successful! Welcome to NYRAA Admin", "success")
        login(username, password) // Update context
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials"
      setError(errorMessage)
      addToast("Login failed. Please check your credentials.", "error")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    addToast("Password reset link sent to admin@nyraa.com", "success")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 rounded-xl">
            <img
              src="assets/logo/nyraalogo.png"
              alt="NYRAA Logo"
              className="w-20 h-20 object-contain"
            />          
            </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#C77096] to-[#A83E68] bg-clip-text text-transparent">
                NYRAA
              </h1>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm animate-in slide-in-from-top duration-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <div className="text-center space-y-1">
            <p className="text-sm">
              <span className="font-semibold">Username:</span> admin
            </p>
            <p className="text-sm">
              <span className="font-semibold">Password:</span> admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
