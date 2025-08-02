
import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Calendar, Edit, Save, X, Camera, Shield, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Profile = () => {
  const { user, updateProfile, uploadProfileImage, changePassword, loading } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "+91 98765 43210",
    role: user?.role || "",
    department: user?.department || "Administration",
    joinDate: user?.joinDate || "January 2024",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "+91 98765 43210",
        role: user.role || "",
        department: user.department || "Administration",
        joinDate: user.joinDate || "January 2024",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadProfileImage(file);
        addToast("Profile image updated successfully!", "success");
      } catch (error) {
        addToast(error.message || "Failed to upload image", "error");
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      addToast("Profile updated successfully!", "success");
    } catch (error) {
      addToast(error.message || "Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "+91 98765 43210",
      role: user?.role || "",
      department: user?.department || "Administration",
      joinDate: user?.joinDate || "January 2024",
    });
    setIsEditing(false);
  };

  const validatePasswordForm = () => {
    let valid = true;
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      valid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
      valid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setPasswordErrors(errors);
    return valid;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        addToast("Password changed successfully!", "success");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        addToast(error.message || "Failed to change password", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account information and settings</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/50">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="text-white" size={32} />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-white p-1 sm:p-1.5 rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Camera size={14} className="text-gray-600" />
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{user?.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-gray-600">{user?.role}</span>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
               className="bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:brightness-110 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Edit size={14} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-green-700 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-gray-700 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm sm:text-base text-gray-700">{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm sm:text-base text-gray-700">{formData.username}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-sm sm:text-base text-gray-700">{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-sm sm:text-base text-gray-700">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Shield size={14} className="text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-700">{formData.role}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Join Date</label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-700">{formData.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/50">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Password</h4>
                <p className="text-xs sm:text-sm text-gray-600">Last changed: Never</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-indigo-700 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Key size={14} />
                Change Password
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPasswordModal(false)}
            />
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md transform transition-all">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-gradient-to-l from-[#C77096] to-[#A83E68] text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;