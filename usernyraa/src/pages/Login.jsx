"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, LogIn, AlertCircle, CheckCircle } from "lucide-react"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import axios from "axios"
import "../styles/Login.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpOption, setShowOtpOption] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    clearMessages()
    setIsLoading(true)

    if (!email) {
      setError("Please enter your email")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: email.toLowerCase().trim(),
      })

      if (response.data.success) {
        setOtpSent(true)
        setSuccess("OTP sent to your email successfully!")
        setCountdown(60)
      }
    } catch (error) {
      console.error("Send OTP error:", error)
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    clearMessages()
    setIsLoading(true)

    if (!otp) {
      setError("Please enter the OTP")
      setIsLoading(false)
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      })

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        if (!response.data.user.profileComplete) {
          setShowProfileForm(true)
          setSuccess("OTP verified! Please complete your profile.")
        } else {
          setSuccess("Login successful! Redirecting...")
          setTimeout(() => navigate("/"), 1500)
        }
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      setError(error.response?.data?.message || "Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProfile = async (e) => {
    e.preventDefault()
    clearMessages()
    setIsLoading(true)

    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both name and phone number")
      setIsLoading(false)
      return
    }

    if (phone.length < 10) {
      setError("Phone number must be at least 10 digits")
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: name.trim(),
          phone: phone.replace(/\D/g, "").slice(0, 15),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        setSuccess("Profile completed successfully! Redirecting...")
        setTimeout(() => navigate("/"), 1500)
      }
    } catch (error) {
      console.error("Complete profile error:", error)
      setError(error.response?.data?.message || "Failed to complete profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      clearMessages()
      setIsLoading(true)

      const response = await axios.post("http://localhost:5000/api/auth/google", {
        token: credentialResponse.credential,
      })

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        setSuccess("Google login successful! Redirecting...")
        setTimeout(
          () =>
            navigate(
              response.data.isNewUser || !response.data.user.profileComplete ? "/account/profile?complete=true" : "/",
            ),
          1500,
        )
      }
    } catch (error) {
      console.error("Google login error:", error)
      setError(error.response?.data?.message || "Google login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error("Google login failed")
    setError("Google login failed. Please try again.")
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    clearMessages()
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: email.toLowerCase().trim(),
      })

      if (response.data.success) {
        setSuccess("New OTP sent to your email!")
        setCountdown(60)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLoginMethod = () => {
    setShowOtpOption(!showOtpOption)
    clearMessages()
    setOtpSent(false)
    setOtp("")
    setEmail("")
    setShowProfileForm(false)
    setName("")
    setPhone("")
  }

  useEffect(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    localStorage.removeItem("isLoggedIn")
  }, [])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="user-icon-container">
              <User size={32} />
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <div className="login-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={18} className="me-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                <CheckCircle size={18} className="me-2" />
                {success}
              </div>
            )}

            {!showOtpOption && (
              <div className="google-login-section">
                <GoogleLogin
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled || isLoading}
                      className="google-signin-btn"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="google-logo" />
                      Sign in with Google
                    </button>
                  )}
                />

                <div className="or-divider">
                  <span className="or-text">OR</span>
                </div>

                <button className="switch-method-btn" onClick={toggleLoginMethod} type="button">
                  Show Another Option
                </button>
              </div>
            )}

            {showOtpOption && !showProfileForm && (
              <div className="otp-login-section">
                <button className="back-to-google-btn" onClick={toggleLoginMethod} type="button">
                  ← Back to Google Sign-in
                </button>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="otp-form">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-text">We'll send you an OTP to verify your email</div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail size={18} className="me-2" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="otp-form">
                    <div className="form-group">
                      <label htmlFor="otp" className="form-label">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        className="form-control otp-input"
                        id="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength="6"
                        required
                      />
                      <div className="form-text">Enter the OTP sent to {email}</div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} className="me-2" />
                          Verify OTP
                        </>
                      )}
                    </button>

                    <div className="resend-section">
                      {countdown > 0 ? (
                        <span className="resend-timer">Resend OTP in {countdown}s</span>
                      ) : (
                        <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={isLoading}>
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="back-to-email-btn"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp("")
                        clearMessages()
                      }}
                    >
                      Back to Email
                    </button>
                  </form>
                )}
              </div>
            )}

            {showProfileForm && (
              <div className="profile-complete-section mt-3">
                <h3 className="profile-complete-title">Complete Your Profile</h3>
                <p className="profile-complete-subtitle">Please provide your name and phone number to continue</p>
                <form onSubmit={handleCompleteProfile} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block mt-3"
                    disabled={isLoading || !name.trim() || !phone.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login
