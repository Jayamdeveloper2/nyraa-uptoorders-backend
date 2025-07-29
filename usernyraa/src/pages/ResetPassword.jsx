import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally verify token validity on mount
    const verifyToken = async () => {
      try {
        await axios.get(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
      } catch (error) {
        setError("Invalid or expired reset token");
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password,
      });
      setSuccess(response.data.message);
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col col-lg-5 col-md-8 col-sm-10">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-header text-center bg-primary text-white py-4 border-0 rounded-top">
                <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle p-3 mb-3">
                  <Lock size={28} />
                </div>
                <h2 className="fw-bold mb-0">Reset Password</h2>
                <p className="text-white-50 mt-2 mb-0">Enter your new password</p>
              </div>
              
              <div className="card-body p-4 p-lg-5">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <div className="me-2">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}
                {success && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <div className="me-2">✅</div>
                    <div>{success}</div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">
                      New Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={18} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0"
                        id="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={18} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <Lock size={18} className="me-2" />
                    )}
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .reset-password-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          background-color: #f9fafb;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .form-control:focus, .input-group-text {
          box-shadow: none;
          border-color: #e9ecef;
        }
        
        .input-group-text {
          background-color: #f8f9fa;
        }
        
        .btn-primary {
          background-color: #BE6992;
          border-color: #BE6992;
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #D47A9D;
          border-color: #D47A9D;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .text-primary {
          color: #BE6992 !important;
        }
        
        .bg-primary {
          background-color: #BE6992 !important;
        }
      `}</style>
      
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
    </div>
  );
};

export default ResetPassword;