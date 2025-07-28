
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Form, FormCheck, Modal } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { clearCart } from "../store/cartSlice"
import { AddAddressButton, ConfirmOrderButton } from "../components/ui/Buttons"
import { getAddresses, saveAddress } from "../data/profileData"
import { orderService } from "../services/orderService"

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const cartItems = useSelector((state) => state.cart.items)
  const [addresses, setAddresses] = useState(getAddresses())
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    isDefault: false,
    type: "home",
    paymentMethod: "creditCard",
  })
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [serverStatus, setServerStatus] = useState("checking")
  const [authStatus, setAuthStatus] = useState("checking")
  const [systemReady, setSystemReady] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    checkSystemStatus()
  }, [navigate])

  const checkSystemStatus = async () => {
    try {
      setServerStatus("checking")
      setAuthStatus("checking")
      setSystemReady(false)

      // Step 1: Check server connection
      console.log("🔍 Checking server connection...")
      await orderService.testConnection()
      setServerStatus("online")
      console.log("✅ Server is online")

      // Step 2: Check authentication
      console.log("🔍 Checking authentication...")
      const isAuth = orderService.isAuthenticated()
      const userData = orderService.getUserData()

      console.log("Authentication check:", { isAuth, userData })

      if (!isAuth || !userData.email) {
        setAuthStatus("unauthenticated")
        setIsLoggedIn(false)

        toast.error("Please log in to proceed with checkout.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login", {
            state: {
              from: location.pathname,
              message: "Please log in to continue with checkout",
            },
          })
        }, 2000)
        return
      }

      // Step 3: Test authentication with server
      try {
        await orderService.testAuth()
        setAuthStatus("authenticated")
        setIsLoggedIn(true)
        setSystemReady(true)
        console.log("✅ Authentication successful")
      } catch (authError) {
        console.error("❌ Authentication test failed:", authError)
        setAuthStatus("unauthenticated")
        setIsLoggedIn(false)

        toast.error("Your session has expired. Please log in again.", {
          position: "top-center",
          autoClose: 5000,
        })

        setTimeout(() => {
          navigate("/login", {
            state: {
              from: location.pathname,
              message: "Session expired. Please log in again.",
            },
          })
        }, 2000)
      }
    } catch (serverError) {
      console.error("❌ Server check failed:", serverError)
      setServerStatus("offline")
      setAuthStatus("unknown")
      setIsLoggedIn(false)
      setSystemReady(false)

      toast.error("Cannot connect to the server. Please ensure the backend is running.", {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  useEffect(() => {
    if (systemReady) {
      setAddresses(getAddresses())
      const defaultAddress = getAddresses().find((addr) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      }
    }
  }, [systemReady])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id)
  }

  const handleAddAddressClick = () => {
    if (!isLoggedIn || !systemReady) {
      toast.error("Please log in to add a shipping address.", {
        position: "top-center",
        autoClose: 5000,
      })
      navigate("/login")
      return
    }
    setShowAddressModal(true)
  }

  const handleAddNewAddress = (e) => {
    e.preventDefault()
    const { name, street, city, state, zip, phone } = formData
    if (!name || !street || !city || !state || !zip || !phone) {
      toast.error("Please fill all required fields.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }
    const updatedAddresses = saveAddress(formData)
    setAddresses(updatedAddresses)
    setSelectedAddressId(formData.id || Date.now())
    setShowAddressModal(false)
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      phone: "",
      isDefault: false,
      type: "home",
      paymentMethod: "creditCard",
    })
    toast.success("Address added successfully", {
      position: "top-right",
      autoClose: 3000,
    })
  }

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE10") {
      setCouponDiscount(0.1)
      toast.success("Coupon applied! 10% off your order.", {
        position: "top-right",
        autoClose: 3000,
      })
    } else {
      setCouponDiscount(0)
      toast.error("Invalid coupon code.", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const shipping = 10.0
    const tax = subtotal * 0.08
    const discount = subtotal * couponDiscount
    return (subtotal + shipping + tax - discount).toFixed(2)
  }

  const getProductImage = (item) => {
    // Handle different image formats from your database with proper caching
    if (item.image && item.image !== "https://via.placeholder.com/100") {
      if (item.image.startsWith("http")) {
        return item.image
      }
      return `/uploads/products/${item.image}`
    }

    // If item has images array (from product data)
    if (item.images) {
      try {
        const images = typeof item.images === "string" ? JSON.parse(item.images) : item.images
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0]
          if (typeof firstImage === "string") {
            return firstImage.startsWith("http") ? firstImage : `/uploads/products/${firstImage}`
          }
          if (typeof firstImage === "object" && firstImage.url) {
            return firstImage.url.startsWith("http") ? firstImage.url : `/uploads/products/${firstImage.url}`
          }
        }
      } catch (e) {
        console.warn("Error parsing product images:", e)
      }
    }

    return "/placeholder.svg?height=100&width=100&text=Product"
  }

  const handleConfirmOrder = async () => {
    // Pre-flight checks
    if (serverStatus === "offline") {
      toast.error("Cannot connect to the server. Please ensure the backend is running.", {
        position: "top-center",
        autoClose: 5000,
      })
      return
    }

    if (!systemReady || !isLoggedIn || authStatus !== "authenticated") {
      toast.error("Please log in to proceed with checkout.", {
        position: "top-center",
        autoClose: 5000,
      })
      navigate("/login")
      return
    }

    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
    if (!selectedAddress) {
      toast.error("Please select a valid address.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      // Double-check authentication before proceeding
      if (!orderService.isAuthenticated()) {
        throw new Error("Authentication required. Please log in again.")
      }

      const subtotal = getSubtotal()
      const shipping = 10.0
      const tax = subtotal * 0.08
      const discount = subtotal * couponDiscount
      const total = subtotal + shipping + tax - discount

      // Prepare shipping address object (ensure it's a proper object)
      const shippingAddressData = {
        name: selectedAddress.name,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        country: selectedAddress.country,
        phone: selectedAddress.phone,
        type: selectedAddress.type || "home",
      }

      // Prepare order data for backend
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: getProductImage(item),
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          variant: {
            color: item.color || null,
            size: item.size || null,
            type: item.type || null,
            carat: item.carat || null,
          },
        })),
        shippingAddress: shippingAddressData,
        billingAddress: shippingAddressData, // Using same address for billing
        paymentMethod: formData.paymentMethod || "creditCard",
        specialInstructions: specialInstructions || "",
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
      }

      console.log("Sending order data:", JSON.stringify(orderData, null, 2))

      // Make actual API call to create order
      const result = await orderService.createOrder(orderData)

      if (result.success) {
        // Store order details for confirmation page
        localStorage.setItem(
          "lastOrder",
          JSON.stringify({
            id: result.order.id,
            orderNumber: result.order.orderNumber,
            items: cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: getProductImage(item),
              color: item.color || null,
              carat: item.carat || null,
            })),
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2),
            shippingAddress: selectedAddress,
            specialInstructions,
            orderDate: new Date().toISOString(),
            status: "pending",
            paymentMethod: formData.paymentMethod || "creditCard",
          }),
        )

        // Clear cart from Redux store
        dispatch(clearCart())

        // Clear cart from localStorage
        localStorage.removeItem("cart")

        toast.success("Order placed successfully!", {
          position: "top-right",
          autoClose: 3000,
        })

        // Navigate to confirmation page
        navigate("/checkout/confirmation")
      } else {
        throw new Error(result.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Order creation error:", error)

      if (error.message.includes("Authentication required") || error.message.includes("No token provided")) {
        toast.error("Your session has expired. Please log in again.", {
          position: "top-center",
          autoClose: 5000,
        })
        navigate("/login", {
          state: {
            from: location.pathname,
            message: "Session expired. Please log in to continue.",
          },
        })
      } else if (error.message.includes("Cannot connect to server")) {
        toast.error("Server connection failed. Please try again later.", {
          position: "top-right",
          autoClose: 5000,
        })
      } else {
        toast.error(error.message || "Failed to place order. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking system status
  if (serverStatus === "checking" || authStatus === "checking") {
    return (
      <div className="checkout-container">
        <div className="text-center py-5">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Initializing Checkout</h4>
          <p className="text-muted">
            {serverStatus === "checking" && "Connecting to server..."}
            {serverStatus === "online" && authStatus === "checking" && "Verifying authentication..."}
          </p>
        </div>
      </div>
    )
  }

  // Show server offline state
  if (serverStatus === "offline") {
    return (
      <div className="checkout-container">
        <div className="text-center py-5">
          <div className="alert alert-danger">
            <h4>🔌 Server Connection Failed</h4>
            <p>Cannot connect to the backend server. Please ensure:</p>
            <ul className="text-start">
              <li>Your backend server is running on http://localhost:5000</li>
              <li>The database connection is working</li>
              <li>All required API endpoints are available</li>
            </ul>
            <button className="btn btn-primary" onClick={checkSystemStatus}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication required state
  if (!isLoggedIn || authStatus === "unauthenticated") {
    return (
      <div className="checkout-container">
        <div className="text-center py-5">
          <div className="alert alert-warning">
            <h4>🔐 Authentication Required</h4>
            <p>You need to be logged in to proceed with checkout.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={() => navigate("/login")}>
                Go to Login
              </button>
              <button className="btn btn-secondary" onClick={checkSystemStatus}>
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Checkout</h1>
        <div className="d-flex gap-2">
          <span className="badge bg-success">🟢 Server Online</span>
          <span className="badge bg-success">🔐 Authenticated</span>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4 mb-lg-0">
          <h5 className="mb-3">Shipping Information</h5>
          {addresses.length === 0 ? (
            <div className="mb-4">
              <p className="text-muted">No addresses found. Please add a shipping address to proceed.</p>
              <AddAddressButton onClick={handleAddAddressClick} className="mt-2" />
            </div>
          ) : (
            <div className="mb-4">
              <h6>Select Address</h6>
              {addresses.map((address) => (
                <div key={address.id} className="form-check mb-2">
                  <FormCheck
                    type="radio"
                    id={`address-${address.id}`}
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => handleAddressSelect(address.id)}
                    label={
                      <div>
                        <strong>{address.name}</strong> ({address.type})
                        <p className="mb-0">
                          {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
                        </p>
                        <p className="mb-0">Phone: {address.phone}</p>
                        {address.isDefault && <span className="badge bg-primary">Default</span>}
                      </div>
                    }
                  />
                </div>
              ))}
              <AddAddressButton onClick={handleAddAddressClick} className="mt-2" />
            </div>
          )}

          <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add New Address</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddNewAddress}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>State/Province</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="Enter your postal code"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select name="country" value={formData.country} onChange={handleInputChange}>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address Type</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
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
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <div className="d-flex gap-2 flex-wrap">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          <h5 className="mb-3 mt-4">Special Instructions</h5>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Enter any special instructions..."
            />
          </Form.Group>

          <h5 className="mb-3 mt-4">Payment Method</h5>
          <Form.Group className="mb-3">
            <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
              <option value="creditCard">Credit Card</option>
              <option value="debitCard">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cashOnDelivery">Cash on Delivery</option>
            </Form.Select>
          </Form.Group>
        </div>

        <div className="col-12 col-lg-4">
          <h5 className="mb-3">Order Summary</h5>
          <div className="order-summary p-3 border rounded">
            {cartItems.length === 0 ? (
              <div className="text-center py-4">
                <p>Your cart is empty.</p>
                <button className="btn btn-primary" onClick={() => navigate("/products")}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item mb-3 d-flex align-items-start">
                    <div className="item-image-container me-3">
                      <img
                        src={getProductImage(item) || "/placeholder.svg"}
                        alt={item.name}
                        className="item-image"
                        loading="lazy" // Add lazy loading
                        onError={(e) => {
                          // Prevent infinite error loops
                          if (e.target.src !== "/placeholder.svg?height=100&width=100&text=Product") {
                            e.target.src = "/placeholder.svg?height=100&width=100&text=Product"
                          }
                        }}
                      />
                    </div>
                    <div className="item-details flex-grow-1">
                      <p className="mb-1">
                        <strong>{item.name}</strong>
                      </p>
                      <p className="mb-1 text-muted">
                        {item.color && `Color: ${item.color} | `}
                        {item.carat && `Carat: ${item.carat}`}
                      </p>
                      <p className="mb-0">
                        ₹{item.price.toFixed(2)} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="d-flex justify-content-between mb-2">
                  <p>Subtotal</p>
                  <p>₹{getSubtotal().toFixed(2)}</p>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <p>Shipping</p>
                  <p>₹10.00</p>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <p>Tax (8%)</p>
                  <p>₹{(getSubtotal() * 0.08).toFixed(2)}</p>
                </div>
                {couponDiscount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <p>Discount ({couponCode})</p>
                    <p>-₹{(getSubtotal() * couponDiscount).toFixed(2)}</p>
                  </div>
                )}
                <div className="d-flex justify-content-between mt-3">
                  <h6>Total</h6>
                  <h6>₹{getTotal()}</h6>
                </div>
              </>
            )}
            <div className="mt-3">
              <Form.Group className="d-flex gap-2 flex-wrap">
                <Form.Control
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow-1"
                />
                <button className="btn btn-outline-primary" onClick={applyCoupon}>
                  Apply
                </button>
              </Form.Group>
            </div>
          </div>
          <ConfirmOrderButton
            className="w-100 mt-3"
            onClick={handleConfirmOrder}
            disabled={cartItems.length === 0 || isLoading || !systemReady}
          >
            {isLoading ? "Processing..." : "Confirm Order"}
          </ConfirmOrderButton>
        </div>
      </div>

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
          padding: 2rem 1rem;
          font-family: 'Open Sans', sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }
        h1 {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          color: #222;
          margin-bottom: 1.5rem;
        }
        h5 {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 600;
          color: #222;
        }
        h6 {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: clamp(0.85rem, 2vw, 1rem);
          color: #333;
        }
        .text-muted {
          font-size: clamp(0.8rem, 1.8vw, 0.9rem);
          color: #666;
        }
        .order-summary {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: clamp(1rem, 3vw, 1.5rem);
        }
        .cart-item {
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .item-image-container {
          width: clamp(60px, 15vw, 80px);
          flex-shrink: 0;
        }
        .item-image {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 6px;
          display: block;
        }
        .item-details p {
          font-size: clamp(0.8rem, 1.8vw, 0.9rem);
        }
        .btn {
          border-radius: 6px;
          padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
          font-size: clamp(0.85rem, 2vw, 1rem);
          transition: background-color 0.3s ease, transform 0.2s ease;
          touch-action: manipulation;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-control,
        .form-select {
          font-size: clamp(0.85rem, 2vw, 1rem);
          border-radius: 6px;
          border: 1px solid #ced4da;
          padding: clamp(0.5rem, 2vw, 0.75rem);
        }
        .form-check-label {
          font-size: clamp(0.85rem, 2vw, 1rem);
        }
        .badge {
          font-size: clamp(0.7rem, 1.5vw, 0.8rem);
          padding: 0.4em 0.8em;
        }
        .modal-content {
          border-radius: 12px;
        }
        .modal-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: clamp(1rem, 3vw, 1.25rem);
        }
        .modal-title {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
        }
        .modal-body {
          padding: clamp(1rem, 3vw, 1.5rem);
        }
        .form-check {
          margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
        }
        .d-flex.gap-2 {
          gap: clamp(0.5rem, 2vw, 1rem);
        }
        .row {
          margin-left: 0;
          margin-right: 0;
        }
        .col-12 {
          padding-left: clamp(0.5rem, 2vw, 1rem);
          padding-right: clamp(0.5rem, 2vw, 1rem);
        }
        .alert-warning {
          background-color: #fff3cd;
          border-color: #ffecb5;
          color: #664d03;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .alert-danger {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        @media (max-width: 1200px) {
          .checkout-container {
            padding: 1.5rem 0.75rem;
          }
          .item-image-container {
            width: clamp(50px, 12vw, 70px);
          }
        }

        @media (max-width: 992px) {
          .checkout-container {
            padding: 1.25rem 0.5rem;
          }
          .row {
            flex-direction: column;
          }
          .col-12.col-lg-8,
          .col-12.col-lg-4 {
            width: 100%;
          }
          .order-summary {
            margin-top: 1.5rem;
          }
          .cart-item {
            flex-direction: row;
            align-items: flex-start;
          }
          .item-image-container {
            width: clamp(50px, 10vw, 60px);
          }
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 1rem 0.5rem;
          }
          .cart-item {
            flex-direction: column;
            align-items: stretch;
          }
          .item-image-container {
            width: 100%;
            max-width: 120px;
            margin-bottom: 0.5rem;
          }
          .item-image {
            width: 100%;
            max-width: 120px;
          }
          .btn {
            padding: clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.8rem, 2vw, 1rem);
          }
          .form-control,
          .form-select {
            padding: clamp(0.4rem, 1.5vw, 0.6rem);
          }
          .modal-body .btn {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .checkout-container {
            padding: 0.75rem 0.25rem;
          }
          .cart-item {
            gap: 0.5rem;
          }
          .item-image-container {
            max-width: 100px;
          }
          .btn {
            font-size: clamp(0.75rem, 1.8vw, 0.85rem);
            padding: clamp(0.3rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.8rem);
          }
          .form-control,
          .form-select {
            font-size: clamp(0.75rem, 1.8vw, 0.85rem);
          }
          .form-check-label {
            font-size: clamp(0.75rem, 1.8vw, 0.85rem);
          }
          .modal-body {
            padding: clamp(0.75rem, 2vw, 1rem);
          }
          .modal-title {
            font-size: clamp(0.9rem, 2vw, 1rem);
          }
        }

        @media (min-width: 1400px) {
          .checkout-container {
            max-width: 1600px;
          }
          h1 {
            font-size: 2.25rem;
          }
          h5 {
            font-size: 1.4rem;
          }
          h6 {
            font-size: 1.2rem;
          }
          .item-image-container {
            width: 100px;
          }
        }
      `}</style>
    </div>
  )
}

export default Checkout
