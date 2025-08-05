"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MailIcon, PhoneIcon, UserIcon, CalendarIcon } from "../../components/ui/Myaccounticons/MyAccountIcons"
import {
  EditAddressButton,
  SaveAddressButton,
  CancelButton,
  SignOutButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal"
import axios from "axios"

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("userData")) || {})
  const [editing, setEditing] = useState({ name: false, phone: false })
  const [tempData, setTempData] = useState({
    name: user.name || "",
    phone: user.phone || "",
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    actionType: "signout",
    title: "Confirm Sign Out",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("No authentication token found. Please log in.")
          navigate("/nyraa/login")
          return
        }

        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          setUser(response.data.user)
          setTempData({
            name: response.data.user.name || "",
            phone: response.data.user.phone || "",
          })
          localStorage.setItem("userData", JSON.stringify(response.data.user))

          const completeParam = searchParams.get("complete")
          const profileIncomplete = !response.data.user.profileComplete || completeParam === "true"
          setIsProfileIncomplete(profileIncomplete)

          if (profileIncomplete) {
            setEditing({ name: true, phone: true })
            toast.info("Please complete your profile to continue", {
              position: "top-center",
              autoClose: 5000,
            })
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError(error.response?.data?.message || "Error fetching profile")
        setIsLoading(false)
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userData")
          localStorage.removeItem("isLoggedIn")
          navigate("/nyraa/login")
        }
      }
    }
    fetchProfile()
  }, [navigate, searchParams])

  const handleEdit = (field) => {
    if (isProfileIncomplete) return
    setEditing({ ...editing, [field]: true })
    setTempData({ ...tempData, [field]: user[field] || "" })
  }

  const handleCancel = (field) => {
    if (isProfileIncomplete) return
    setEditing({ ...editing, [field]: false })
    setTempData({ ...tempData, [field]: user[field] || "" })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 15)
      setTempData({ ...tempData, [name]: phoneValue })
    } else {
      setTempData({ ...tempData, [name]: value })
    }
  }

  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found. Please log in.")
        navigate("/nyraa/login")
        return
      }

      if (field === "phone") {
        if (tempData.phone.length < 10) {
          toast.error("Phone number must be at least 10 digits", {
            position: "top-center",
            autoClose: 3000,
          })
          return
        }
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          [field]: tempData[field],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setUser(response.data.user)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        setEditing({ ...editing, [field]: false })

        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const handleCompleteProfile = async () => {
    if (!tempData.name.trim() || !tempData.phone.trim()) {
      toast.error("Please fill in both name and phone number", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    if (tempData.phone.length < 10) {
      toast.error("Phone number must be at least 10 digits", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: tempData.name.trim(),
          phone: tempData.phone.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setUser(response.data.user)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        setEditing({ name: false, phone: false })
        setIsProfileIncomplete(false)

        toast.success("Profile completed successfully! You can now access all features.", {
          position: "top-center",
          autoClose: 3000,
        })

        const redirectPath = sessionStorage.getItem("redirectAfterProfile")
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterProfile")
          setTimeout(() => {
            navigate(redirectPath)
          }, 2000)
        } else {
          setTimeout(() => {
            navigate("/")
          }, 2000)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error completing profile", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  const handleSignOutPrompt = () => {
    setModalConfig({ actionType: "signout", title: "Confirm Sign Out" })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = () => {
    if (modalConfig.actionType === "signout") {
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      localStorage.removeItem("isLoggedIn")
      sessionStorage.clear()
      window.location.href = "/nyraa/login"
    }
    setShowConfirmModal(false)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      toast.error("No file selected", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif"]
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only images (jpeg, jpg, png, gif, webp, avif) are allowed", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post("http://localhost:5000/api/auth/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        // Fetch updated profile to ensure consistency
        const profileResponse = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (profileResponse.data.success) {
          setUser(profileResponse.data.user)
          localStorage.setItem("userData", JSON.stringify(profileResponse.data.user))
          toast.success("Avatar updated successfully!", {
            position: "top-right",
            autoClose: 3000,
          })
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading avatar", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarError = (e) => {
    e.target.src = "https://via.placeholder.com/60"
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {isProfileIncomplete && (
        <div className="profile-incomplete-alert">
          <strong>Complete Your Profile:</strong> Please fill in your name and phone number to access all features like
          cart and checkout.
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.avatar ? (
                <img
                  src={`${user.avatar}?t=${new Date().getTime()}`}
                  alt="User Avatar"
                  className="avatar-img"
                  onError={handleAvatarError}
                />
              ) : (
                <UserIcon />
              )}
            </div>
            <div className="profile-info">
              <h4 className="profile-name">{user.name || "User"}</h4>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          {!isProfileIncomplete && (
            <div className="avatar-upload">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                id="avatarUpload"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
                disabled={isUploading}
              />
              <label htmlFor="avatarUpload" className={`edit-avatar-btn ${isUploading ? "disabled" : ""}`}>
                {isUploading ? "Uploading..." : "Change Photo"}
              </label>
            </div>
          )}
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <div className="profile-field">
              <div className="field-header">
                <div className="field-label">
                  <MailIcon className="field-icon" />
                  <span>Email Address</span>
                </div>
              </div>
              <div className="field-value">
                <span className="field-text">{user.email || "N/A"}</span>
                <small className="field-note">Email cannot be changed</small>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-header">
                <div className="field-label">
                  <UserIcon className="field-icon" />
                  <span>
                    Full Name
                    {isProfileIncomplete && <span className="required-mark">*</span>}
                  </span>
                </div>
                {!editing.name && !isProfileIncomplete ? (
                  <EditAddressButton onClick={() => handleEdit("name")} />
                ) : !isProfileIncomplete ? (
                  <div className="field-actions">
                    <SaveAddressButton onClick={() => handleSave("name")} />
                    <CancelButton onClick={() => handleCancel("name")} />
                  </div>
                ) : null}
              </div>
              <div className="field-value">
                {!editing.name && !isProfileIncomplete ? (
                  <span className="field-text">{user.name || "N/A"}</span>
                ) : (
                  <input
                    type="text"
                    className="field-input"
                    name="name"
                    value={tempData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                )}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-header">
                <div className="field-label">
                  <PhoneIcon className="field-icon" />
                  <span>
                    Phone Number
                    {isProfileIncomplete && <span className="required-mark">*</span>}
                  </span>
                </div>
                {!editing.phone && !isProfileIncomplete ? (
                  <EditAddressButton onClick={() => handleEdit("phone")} />
                ) : !isProfileIncomplete ? (
                  <div className="field-actions">
                    <SaveAddressButton onClick={() => handleSave("phone")} />
                    <CancelButton onClick={() => handleCancel("phone")} />
                  </div>
                ) : null}
              </div>
              <div className="field-value">
                {!editing.phone && !isProfileIncomplete ? (
                  <span className="field-text">{user.phone || "N/A"}</span>
                ) : (
                  <input
                    type="tel"
                    className="field-input"
                    name="phone"
                    value={tempData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                )}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-header">
                <div className="field-label">
                  <CalendarIcon className="field-icon" />
                  <span>Member Since</span>
                </div>
              </div>
              <div className="field-value">
                <span className="field-text">{user.joinDate || "N/A"}</span>
              </div>
            </div>
          </div>

          {isProfileIncomplete && (
            <div className="complete-profile-section">
              <button
                className="complete-profile-btn"
                onClick={handleCompleteProfile}
                disabled={!tempData.name.trim() || !tempData.phone.trim()}
              >
                Complete Profile
              </button>
              <p className="complete-profile-note">
                You must complete your profile to access cart and checkout features.
              </p>
            </div>
          )}

          {!isProfileIncomplete && (
            <div className="profile-actions">
              <SignOutButton onClick={handleSignOutPrompt} />
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Sign Out"
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner p {
          margin-top: 15px;
          color: #6b7280;
        }

        .profile-incomplete-alert {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          color: #92400e;
          font-size: 14px;
        }

        .profile-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .profile-header {
          background: linear-gradient(135deg, #D0779B 0%, #B8657F 100%);
          padding: 32px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info h4 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .profile-email {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .edit-avatar-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-avatar-btn:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .edit-avatar-btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-body {
          padding: 32px 24px;
        }

        .profile-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-field {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
        }

        .profile-field:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .field-icon {
          color: #D0779B;
          width: 16px;
          height: 16px;
        }

        .required-mark {
          color: #ef4444;
          margin-left: 4px;
        }

        .field-actions {
          display: flex;
          gap: 8px;
        }

        .field-value {
          margin-left: 24px;
        }

        .field-text {
          color: #6b7280;
          font-size: 14px;
        }

        .field-note {
          display: block;
          color: #9ca3af;
          font-size: 12px;
          margin-top: 4px;
        }

        .field-input {
          width: 100%;
          max-width: 300px;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .field-input:focus {
          outline: none;
          border-color: #D0779B;
          box-shadow: 0 0 0 3px rgba(208, 119, 155, 0.1);
        }

        .complete-profile-section {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .complete-profile-btn {
          background: linear-gradient(135deg, #D0779B 0%, #B8657F 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .complete-profile-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(208, 119, 155, 0.3);
        }

        .complete-profile-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .complete-profile-note {
          margin-top: 12px;
          color: #6b7280;
          font-size: 13px;
        }

        .profile-actions {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          text-align: right;
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 16px;
          }

          .profile-header {
            padding: 24px 20px;
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .profile-avatar-section {
            flex-direction: column;
            gap: 12px;
          }

          .profile-body {
            padding: 24px 20px;
          }

          .field-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .field-value {
            margin-left: 0;
          }

          .field-input {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile
