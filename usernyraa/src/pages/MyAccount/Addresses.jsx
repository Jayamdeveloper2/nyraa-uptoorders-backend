"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  AddAddressButton,
  SetDefaultButton,
  DeleteAddressButton,
  CancelButton,
  EditAddressButton,
  SaveAddressButton,
  ResetButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { HomeIcon, WorkIcon, MapPinIcon } from "../../components/ui/Myaccounticons/MyAccountIcons"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal"
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  clearError,
} from "../../store/addressSlice"

const UpdatedAddresses = () => {
  const dispatch = useDispatch()
  const { addresses, loading, error } = useSelector((state) => state.addresses)
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    isDefault: false,
    type: "home",
  })

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    itemToDelete: null,
    actionType: "deleteAddress",
    title: "Confirm Delete Address",
  })

  useEffect(() => {
    dispatch(fetchAddresses())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const validateForm = () => {
    const { name, street, city, state, zip, phone } = formData
    if (!name || !street || !city || !state || !zip || !phone) {
      toast.error("Please fill all required fields.", {
        position: "top-right",
        autoClose: 3000,
      })
      return false
    }

    // Phone validation
    if (!/^\+?[\d\s-()]+$/.test(phone)) {
      toast.error("Please enter a valid phone number.", {
        position: "top-right",
        autoClose: 3000,
      })
      return false
    }

    // ZIP code validation (flexible for international)
    if (!/^[\w\s-]{3,10}$/.test(zip)) {
      toast.error("Please enter a valid postal code.", {
        position: "top-right",
        autoClose: 3000,
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (isEditing) {
        await dispatch(updateAddress({ id: editingAddressId, addressData: formData })).unwrap()
        toast.success("Address updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        await dispatch(createAddress(formData)).unwrap()
        toast.success("Address added successfully!", {
          position: "top-right",
          autoClose: 3000,
        })
      }
      resetForm()
    } catch (error) {
      // Error is already handled by the error state
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      phone: "",
      isDefault: false,
      type: "home",
    })
    setShowForm(false)
    setIsEditing(false)
    setEditingAddressId(null)
  }

  const resetFields = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      phone: "",
      isDefault: false,
      type: "home",
    })
  }

  const handleDeletePrompt = (id) => {
    setModalConfig({
      itemToDelete: id,
      actionType: "deleteAddress",
      title: "Confirm Delete Address",
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    if (modalConfig.actionType === "deleteAddress" && modalConfig.itemToDelete) {
      try {
        await dispatch(deleteAddress(modalConfig.itemToDelete)).unwrap()
        toast.success("Address deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        })
      } catch (error) {
        // Error is already handled by the error state
      }
    }
    setShowConfirmModal(false)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }

  const editAddressHandler = (id) => {
    const addressToEdit = addresses.find((addr) => addr.id === id)
    if (addressToEdit) {
      setFormData({ ...addressToEdit })
      setIsEditing(true)
      setEditingAddressId(id)
      setShowForm(true)
    }
  }

  const setDefaultAddressHandler = async (id) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap()
      toast.success("Default address updated!", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      // Error is already handled by the error state
    }
  }

  const getAddressTypeIcon = (type) => {
    if (type === "home") return <HomeIcon />
    if (type === "work") return <WorkIcon />
    return <MapPinIcon />
  }

  if (loading && addresses.length === 0) {
    return (
      <div className="addresses-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="addresses-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold">Address Book</h2>
        {showForm ? (
          <CancelButton onClick={resetForm} disabled={loading} />
        ) : (
          <AddAddressButton onClick={() => setShowForm(true)} className="btn-primary" disabled={loading} />
        )}
      </div>

      {showForm && (
        <div className="card mb-4 border-0 shadow-lg rounded-4">
          <div className="card-header bg-gradient">
            <h5 className="card-title mb-0 fw-semibold">{isEditing ? "Edit Address" : "Add New Address"}</h5>
          </div>
          <div className="card-body p-3">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Street Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">State/Province *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Country</label>
                  <select
                    className="form-select"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Address Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="defaultAddress"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="defaultAddress">
                      Set as default shipping address
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2 justify-content-end button-container">
                    <SaveAddressButton type="submit" disabled={loading} />
                    <ResetButton onClick={resetFields} disabled={loading} />
                    <CancelButton onClick={resetForm} disabled={loading} />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3">
        {addresses.map((address) => (
          <div key={address.id} className="col-md-6 col-sm-12 mb-3">
            <div
              className={`card h-100 border-0 shadow-lg rounded-4 position-relative ${
                address.isDefault ? "border-start border-gold border-4" : ""
              }`}
            >
              {address.isDefault && (
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge bg-gradient rounded-pill px-2 py-1">Default</span>
                </div>
              )}
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <div
                    className={`rounded p-1 me-2 ${
                      address.isDefault ? "bg-gradient text-white" : "bg-light text-gold"
                    }`}
                  >
                    {getAddressTypeIcon(address.type)}
                  </div>
                  <h5 className="card-title mb-0 fw-semibold">{address.name}</h5>
                </div>
                <div className="address-details ps-1 mb-3">
                  <p className="card-text mb-1">{address.street}</p>
                  <p className="card-text mb-1">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="card-text mb-1">{address.country}</p>
                  <p className="card-text text-muted">
                    <span className="text-secondary">Phone:</span> {address.phone}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <EditAddressButton
                    addressId={address.id}
                    onClick={() => editAddressHandler(address.id)}
                    disabled={loading}
                  />
                  <DeleteAddressButton
                    addressId={address.id}
                    onClick={() => handleDeletePrompt(address.id)}
                    disabled={loading}
                  />
                  {!address.isDefault && (
                    <SetDefaultButton
                      addressId={address.id}
                      onClick={() => setDefaultAddressHandler(address.id)}
                      disabled={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {addresses.length === 0 && !loading && (
        <div className="text-center py-4 my-3 bg-light rounded-4 shadow-sm">
          <MapPinIcon className="text-gold mb-2" />
          <h5>No addresses saved yet</h5>
          <p className="text-muted">Add your first address to get started.</p>
        </div>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Delete"
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
        .addresses-container {
          font-family: 'Open Sans', sans-serif;
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
          padding: 1.5rem 1rem;
          border-radius: 12px;
          margin: 1rem auto;
          max-width: 1200px;
        }
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #222;
          letter-spacing: 0.5px;
        }
        h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
          line-height: 1.5;
        }
        .card {
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
        }
        .border-gold {
          border-color: #c5a47e !important;
        }
        .bg-gradient {
          background: linear-gradient(135deg, #c5a47e 0%, #b58963 100%);
          color: #fff;
        }
        .text-gold {
          color: #c5a47e !important;
        }
        .form-control,
        .form-select {
          font-size: 0.9rem;
          border-radius: 8px;
          border: 1px solid #ced4da;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #c5a47e;
          box-shadow: 0 0 8px rgba(197, 164, 126, 0.3);
          outline: none;
        }
        .form-control:disabled,
        .form-select:disabled {
          background-color: #f8f9fa;
          opacity: 0.7;
        }
        .form-label {
          font-size: 0.85rem;
          color: #333;
          font-weight: 500;
        }
        .badge {
          font-size: 0.75rem;
          background: linear-gradient(135deg, #c5a47e 0%, #b58963 100%);
        }
        .button-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
          max-width: 100%;
          overflow: hidden;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        @media (max-width: 767px) {
          .addresses-container {
            padding: 1rem 0.75rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
          p {
            font-size: 0.85rem;
          }
          .form-control,
          .form-select {
            font-size: 0.85rem;
          }
          .card {
            border-radius: 8px;
          }
          .button-container {
            flex-direction: row;
            justify-content: flex-end;
            gap: 6px;
          }
        }
        @media (max-width: 576px) {
          .addresses-container {
            padding: 0.75rem 0.5rem;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          p {
            font-size: 0.8rem;
          }
          .form-control,
          .form-select {
            font-size: 0.8rem;
          }
          .badge {
            font-size: 0.7rem;
          }
          .button-container {
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .button-container > * {
            width: 100%;
            max-width: 180px;
          }
        }
      `}</style>
    </div>
  )
}

export default UpdatedAddresses
