"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Form, FormCheck, Modal, Button, Alert } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { createOrder, clearError } from "../store/orderSlice"
import { clearCart } from "../store/cartSlice"
import { fetchAddresses, createAddress, clearError as clearAddressError } from "../store/addressSlice"
import { getUserData } from "../data/profileData"

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const cartItems = useSelector((state) => state.cart.items)
  const { loading: orderLoading, error: orderError } = useSelector((state) => state.orders)
  const { addresses, loading: addressLoading, error: addressError } = useSelector((state) => state.addresses)

  // State for selected address
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // State for address form
  const [addressForm, setAddressForm] = useState({
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

  // State for order details
  const [orderDetails, setOrderDetails] = useState({
    paymentMethod: "creditCard",
    specialInstructions: "",
    couponCode: "",
    couponDiscount: 0,
  })

  // State for validation and UI
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize component
  useEffect(() => {
    window.scrollTo(0, 0)
    initializeCheckout()
  }, [location.pathname])

  // Handle order errors
  useEffect(() => {
    if (orderError) {
      toast.error(orderError, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
    }
  }, [orderError, dispatch])

  // Handle address errors
  useEffect(() => {
    if (addressError) {
      toast.error(addressError, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearAddressError())
    }
  }, [addressError, dispatch])

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      } else {
        // If no default, select the first address
        setSelectedAddressId(addresses[0].id)
      }
    }
  }, [addresses, selectedAddressId])

  const initializeCheckout = () => {
    const userData = getUserData()
    if (!userData.email) {
      setIsLoggedIn(false)
      toast.error(
        <div className="toast-content">
          <p className="mb-3">Please log in to proceed with checkout.</p>
          <Button size="sm" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          closeOnClick: false,
          draggable: false,
        },
      )
      navigate("/login")
      return
    }

    setIsLoggedIn(true)
    // Load addresses from database
    dispatch(fetchAddresses())
  }

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleOrderDetailsChange = (e) => {
    const { name, value } = e.target
    setOrderDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateAddressForm = () => {
    const errors = {}
    const required = ["name", "street", "city", "state", "zip", "phone"]

    required.forEach((field) => {
      if (!addressForm[field] || addressForm[field].trim() === "") {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })

    // Phone validation
    if (addressForm.phone && !/^\+?[\d\s-()]+$/.test(addressForm.phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    // ZIP code validation (flexible for international)
    if (addressForm.zip && !/^[\w\s-]{3,10}$/.test(addressForm.zip)) {
      errors.zip = "Please enter a valid postal code"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAddress = () => {
    if (!isLoggedIn) {
      toast.error("Please log in to add a shipping address.")
      navigate("/login")
      return
    }

    setAddressForm({
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
    setFormErrors({})
    setShowAddressModal(true)
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()

    if (!validateAddressForm()) {
      return
    }

    try {
      const newAddress = await dispatch(createAddress(addressForm)).unwrap()
      setSelectedAddressId(newAddress.id)
      setShowAddressModal(false)

      toast.success("Address added successfully", {
        position: "top-right",
        autoClose: 3000,
      })

      // Reset form
      setAddressForm({
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
      setFormErrors({})
    } catch (error) {
      toast.error(error || "Failed to add address", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const applyCoupon = () => {
    const code = orderDetails.couponCode.toUpperCase()
    let discount = 0
    let message = ""

    switch (code) {
      case "SAVE10":
        discount = 0.1
        message = "10% discount applied!"
        break
      case "SAVE20":
        discount = 0.2
        message = "20% discount applied!"
        break
      case "WELCOME":
        discount = 0.15
        message = "15% welcome discount applied!"
        break
      case "FIRST":
        discount = 0.25
        message = "25% first-time buyer discount applied!"
        break
      default:
        message = "Invalid coupon code"
    }

    setOrderDetails((prev) => ({ ...prev, couponDiscount: discount }))

    if (discount > 0) {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
      })
    } else {
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const removeCoupon = () => {
    setOrderDetails((prev) => ({
      ...prev,
      couponDiscount: 0,
      couponCode: "",
    }))
    toast.info("Coupon removed", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const calculateOrderSummary = () => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = subtotal > 500 ? 0 : 50 // Free shipping over ₹500
    const tax = subtotal * 0.08 // 8% tax
    const discount = subtotal * orderDetails.couponDiscount
    const total = subtotal + shipping + tax - discount

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const validateOrder = () => {
    if (!isLoggedIn) {
      toast.error("Please log in to proceed with checkout.")
      return false
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.")
      return false
    }

    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address.")
      return false
    }

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
    if (!selectedAddress) {
      toast.error("Please select a valid address.")
      return false
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateOrder()) {
      return
    }

    setIsProcessing(true)
    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
    const orderSummary = calculateOrderSummary()

    const orderData = {
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: item.image || "/placeholder.svg?height=100&width=100&text=Product",
        color: item.color || null,
        size: item.size || null,
        carat: item.carat || null,
      })),
      subtotal: orderSummary.subtotal,
      shipping: orderSummary.shipping,
      tax: orderSummary.tax,
      discount: orderSummary.discount,
      total: orderSummary.total,
      shippingAddress: selectedAddress,
      specialInstructions: orderDetails.specialInstructions,
      couponCode: orderDetails.couponDiscount > 0 ? orderDetails.couponCode : null,
      paymentMethod: orderDetails.paymentMethod,
    }

    try {
      await dispatch(createOrder(orderData)).unwrap()
      dispatch(clearCart())

      toast.success("Order placed successfully!", {
        position: "top-right",
        autoClose: 3000,
      })

      navigate("/checkout/confirmation")
    } catch (error) {
      console.error("Order creation failed:", error)
      toast.error(error || "Failed to create order. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const orderSummary = calculateOrderSummary()

  return (
    <div className="checkout-container">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            <h1 className="checkout-title">Checkout</h1>

            {/* Progress Indicator */}
            <div className="progress-indicator mb-4">
              <div className="progress-step active">
                <div className="step-number">1</div>
                <div className="step-label">Shipping</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">2</div>
                <div className="step-label">Payment</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">3</div>
                <div className="step-label">Confirmation</div>
              </div>
            </div>

            <div className="row">
              {/* Left Column - Shipping & Payment */}
              <div className="col-lg-8 mb-4">
                {/* Shipping Address Section */}
                <div className="checkout-section">
                  <div className="section-header">
                    <h3>Shipping Address</h3>
                    <Button variant="outline-primary" size="sm" onClick={handleAddAddress} disabled={addressLoading}>
                      {addressLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Loading...
                        </>
                      ) : (
                        "Add New Address"
                      )}
                    </Button>
                  </div>

                  {addressLoading && addresses.length === 0 ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading addresses...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading your saved addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <Alert variant="info">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <i className="fas fa-info-circle"></i>
                        </div>
                        <div>
                          <strong>No addresses found.</strong>
                          <p className="mb-0">Please add a shipping address to proceed with your order.</p>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    <div className="address-list">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`address-card ${selectedAddressId === address.id ? "selected" : ""}`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <div className="address-header">
                            <FormCheck
                              type="radio"
                              id={`address-${address.id}`}
                              name="selectedAddress"
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id)}
                              className="me-3"
                            />
                            <div className="address-info flex-grow-1">
                              <div className="address-name">
                                <strong>{address.name}</strong>
                                <span className="address-type ms-2">({address.type})</span>
                                {address.isDefault && <span className="badge bg-primary ms-2">Default</span>}
                              </div>
                              <div className="address-details mt-2">
                                <p className="mb-1 text-muted">{address.street}</p>
                                <p className="mb-1 text-muted">
                                  {address.city}, {address.state} {address.zip}
                                </p>
                                <p className="mb-1 text-muted">{address.country}</p>
                                <p className="mb-0 text-muted">
                                  <i className="fas fa-phone me-1"></i>
                                  {address.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Method Section */}
                <div className="checkout-section">
                  <h3>Payment Method</h3>
                  <div className="payment-methods">
                    {[
                      
                      { value: "cashOnDelivery", label: "Cash on Delivery", icon: "💰" },
                    ].map((method) => (
                      <div key={method.value} className="payment-method">
                        <FormCheck
                          type="radio"
                          id={`payment-${method.value}`}
                          name="paymentMethod"
                          value={method.value}
                          checked={orderDetails.paymentMethod === method.value}
                          onChange={handleOrderDetailsChange}
                          label={
                            <div className="payment-label">
                              <span className="payment-icon">{method.icon}</span>
                              <span>{method.label}</span>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions Section */}
                <div className="checkout-section">
                  <h3>Special Instructions</h3>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="specialInstructions"
                      value={orderDetails.specialInstructions}
                      onChange={handleOrderDetailsChange}
                      placeholder="Enter any special instructions for your order..."
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="col-lg-4">
                <div className="order-summary-sticky">
                  <div className="checkout-section order-summary">
                    <h3>Order Summary</h3>

                    {/* Cart Items */}
                    <div className="cart-items">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
                          <p className="text-muted">Your cart is empty</p>
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div key={item.id} className="cart-item">
                            <div className="item-image">
                              <img
                                src={item.image || "/placeholder.svg?height=60&width=60&text=Product"}
                                alt={item.name}
                              />
                            </div>
                            <div className="item-details">
                              <h6 className="item-name">{item.name}</h6>
                              <div className="item-variants">
                                {item.color && <span>Color: {item.color}</span>}
                                {item.size && <span>Size: {item.size}</span>}
                                {item.carat && <span>Carat: {item.carat}</span>}
                              </div>
                              <div className="item-price">
                                ₹{item.price.toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                            <div className="item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Coupon Section */}
                    <div className="coupon-section">
                      <div className="coupon-input-group">
                        <Form.Control
                          type="text"
                          placeholder="Enter coupon code"
                          name="couponCode"
                          value={orderDetails.couponCode}
                          onChange={handleOrderDetailsChange}
                        />
                        <Button variant="outline-primary" onClick={applyCoupon} disabled={!orderDetails.couponCode}>
                          Apply
                        </Button>
                      </div>
                      {orderDetails.couponDiscount > 0 && (
                        <div className="applied-coupon">
                          <span>Coupon "{orderDetails.couponCode}" applied</span>
                          <Button variant="link" size="sm" onClick={removeCoupon} className="p-0">
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Order Totals */}
                    <div className="order-totals">
                      <div className="total-line">
                        <span>Subtotal</span>
                        <span>₹{orderSummary.subtotal}</span>
                      </div>
                      <div className="total-line">
                        <span>
                          Shipping
                          {Number.parseFloat(orderSummary.shipping) === 0 && (
                            <small className="text-success"> (Free)</small>
                          )}
                        </span>
                        <span>₹{orderSummary.shipping}</span>
                      </div>
                      <div className="total-line">
                        <span>Tax (8%)</span>
                        <span>₹{orderSummary.tax}</span>
                      </div>
                      {Number.parseFloat(orderSummary.discount) > 0 && (
                        <div className="total-line discount">
                          <span>Discount</span>
                          <span>-₹{orderSummary.discount}</span>
                        </div>
                      )}
                      <div className="total-line total">
                        <span>
                          <strong>Total</strong>
                        </span>
                        <span>
                          <strong>₹{orderSummary.total}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      className="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={
                        cartItems.length === 0 || orderLoading || isProcessing || !selectedAddressId || addressLoading
                      }
                    >
                      {orderLoading || isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        `Place Order - ₹${orderSummary.total}`
                      )}
                    </Button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveAddress}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={addressForm.name}
                    onChange={handleAddressFormChange}
                    isInvalid={!!formErrors.name}
                    placeholder="Enter your full name"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    isInvalid={!!formErrors.phone}
                    placeholder="Enter your phone number"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Street Address *</Form.Label>
              <Form.Control
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressFormChange}
                isInvalid={!!formErrors.street}
                placeholder="Enter your street address"
              />
              <Form.Control.Feedback type="invalid">{formErrors.street}</Form.Control.Feedback>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    isInvalid={!!formErrors.city}
                    placeholder="Enter your city"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.city}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>State/Province *</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressFormChange}
                    isInvalid={!!formErrors.state}
                    placeholder="Enter your state"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.state}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>ZIP/Postal Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="zip"
                    value={addressForm.zip}
                    onChange={handleAddressFormChange}
                    isInvalid={!!formErrors.zip}
                    placeholder="Enter ZIP code"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.zip}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select name="country" value={addressForm.country} onChange={handleAddressFormChange}>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Address Type</Form.Label>
              <Form.Select name="type" value={addressForm.type} onChange={handleAddressFormChange}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Set as default shipping address"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressFormChange}
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={addressLoading}>
                {addressLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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
        .checkout-container {
          padding: 2rem 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .checkout-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #212529;
          text-align: center;
          margin-bottom: 2rem;
        }

        /* Progress Indicator */
        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .progress-step.active .step-number {
          background-color: #0d6efd;
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: #0d6efd;
        }

        .progress-line {
          width: 100px;
          height: 2px;
          background-color: #e9ecef;
          margin: 0 1rem;
        }

        /* Checkout Sections */
        .checkout-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          border: 1px solid #e9ecef;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #212529;
          margin: 0;
        }

        /* Address Cards */
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .address-card {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .address-card:hover {
          border-color: #0d6efd;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
        }

        .address-card.selected {
          border-color: #0d6efd;
          background-color: #f8f9ff;
        }

        .address-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .address-info {
          flex: 1;
        }

        .address-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .address-name strong {
          font-size: 1.1rem;
          color: #212529;
        }

        .address-type {
          color: #6c757d;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .address-details p {
          margin: 0;
          color: #495057;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Payment Methods */
        .payment-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .payment-method {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .payment-method:hover {
          border-color: #0d6efd;
        }

        .payment-method:has(input:checked) {
          border-color: #0d6efd;
          background-color: #f8f9ff;
        }

        .payment-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .payment-icon {
          font-size: 1.25rem;
        }

        /* Order Summary */
        .order-summary-sticky {
          position: sticky;
          top: 2rem;
        }

        .order-summary {
          margin-bottom: 0;
        }

        .cart-items {
          margin-bottom: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }

        .item-variants {
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }

        .item-variants span:not(:last-child)::after {
          content: " • ";
          margin: 0 0.25rem;
        }

        .item-price {
          font-size: 0.85rem;
          color: #495057;
        }

        .item-total {
          font-weight: 600;
          color: #212529;
        }

        /* Coupon Section */
        .coupon-section {
          padding: 1rem 0;
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 1.5rem;
        }

        .coupon-input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .coupon-input-group .form-control {
          flex: 1;
        }

        .applied-coupon {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #d1edff;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #0d6efd;
        }

        /* Order Totals */
        .order-totals {
          margin-bottom: 1.5rem;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .total-line.discount {
          color: #198754;
        }

        .total-line.total {
          font-size: 1.1rem;
          font-weight: 600;
          padding-top: 0.75rem;
          border-top: 2px solid #e9ecef;
          margin-top: 0.75rem;
        }

        /* Place Order Button */
        .place-order-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        /* Trust Indicators */
        .trust-indicators {
          display: flex;
          justify-content: space-around;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #6c757d;
          text-align: center;
        }

        .trust-icon {
          font-size: 1.25rem;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .checkout-container {
            padding: 1rem 0;
          }

          .checkout-title {
            font-size: 2rem;
          }

          .checkout-section {
            padding: 1.5rem;
          }

          .progress-indicator {
            margin-bottom: 2rem;
          }

          .progress-line {
            width: 60px;
          }

          .address-header {
            flex-direction: column;
            gap: 1rem;
          }

          .payment-methods {
            grid-template-columns: 1fr;
          }

          .order-summary-sticky {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 0.5rem 0;
          }

          .checkout-title {
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
          }

          .checkout-section {
            padding: 1rem;
            margin-bottom: 1rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .address-card {
            padding: 1rem;
          }

          .trust-indicators {
            flex-direction: column;
            gap: 1rem;
          }

          .trust-item {
            flex-direction: row;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .progress-indicator {
            display: none;
          }

          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .item-total {
            align-self: flex-end;
          }

          .coupon-input-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default Checkout
