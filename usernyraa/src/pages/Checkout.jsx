import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, FormCheck, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AddAddressButton, ConfirmOrderButton } from "../components/ui/Buttons";
import { getAddresses, saveAddress, getUserData, addOrder } from '../data/profileData';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const [addresses, setAddresses] = useState(getAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
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
    paymentMethod: "creditCard",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!getUserData().email);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setAddresses(getAddresses());
    const defaultAddress = getAddresses().find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }

    if (!isLoggedIn) {
      toast.error(
        <div className="toast-content">
          <p className="mb-3">Please log in to proceed with checkout.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          closeOnClick: false,
          draggable: false,
        }
      );
      navigate("/login");
    }
  }, [navigate, isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
  };

  const handleAddAddressClick = () => {
    if (!isLoggedIn) {
      toast.error(
        <div className="toast-content">
          <p className="mb-3">Please log in to add a shipping address.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          closeOnClick: false,
          draggable: false,
        }
      );
      navigate("/login");
      return;
    }
    setShowAddressModal(true);
  };

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    const { name, street, city, state, zip, phone } = formData;
    if (!name || !street || !city || !state || !zip || !phone) {
      toast.error("Please fill all required fields.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const updatedAddresses = saveAddress(formData);
    setAddresses(updatedAddresses);
    setSelectedAddressId(formData.id || Date.now());
    setShowAddressModal(false);
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
      paymentMethod: "creditCard",
    });
    toast.success("Address added successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE10") {
      setCouponDiscount(0.1);
      toast.success("Coupon applied! 10% off your order.", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      setCouponDiscount(0);
      toast.error("Invalid coupon code.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = 10.0;
    const tax = subtotal * 0.08;
    const discount = subtotal * couponDiscount;
    return (subtotal + shipping + tax - discount).toFixed(2);
  };

  const handleConfirmOrder = () => {
    if (!isLoggedIn) {
      toast.error(
        <div className="toast-content">
          <p className="mb-3">Please log in to proceed with checkout.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          closeOnClick: false,
          draggable: false,
        }
      );
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Please select a valid address.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const orderDetails = {
      id: `NYR-${Date.now()}`,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || "https://via.placeholder.com/100",
        color: item.color || null,
        carat: item.carat || null,
      })),
      subtotal: getSubtotal().toFixed(2),
      shipping: 10.0,
      tax: (getSubtotal() * 0.08).toFixed(2),
      discount: (getSubtotal() * couponDiscount).toFixed(2),
      total: getTotal(),
      shippingAddress: selectedAddress,
      specialInstructions,
      orderDate: new Date().toISOString(),
      status: "Pending",
      deliveryDate: null,
      paymentMethod: formData.paymentMethod || "creditCard",
    };

    addOrder(orderDetails);
    localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
    localStorage.removeItem("cart");
    toast.success("Order placed successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/checkout/confirmation");
  };

  return (
    <div className="checkout-container">
      <h1 className="mb-4">Checkout</h1>
      <div className="row">
        <div className="col-12 col-lg-8 mb-4 mb-lg-0">
          <h5 className="mb-3">Shipping Information</h5>
          {addresses.length === 0 ? (
            <div className="mb-4">
              <p className="text-muted">No addresses found. Please add a shipping address to proceed.</p>
              <AddAddressButton
                onClick={handleAddAddressClick}
                className="mt-2"
              />
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
              <AddAddressButton
                onClick={handleAddAddressClick}
                className="mt-2"
              />
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
            <Form.Select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
            >
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
              <p className="text-center">Your cart is empty.</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item mb-3 d-flex align-items-start">
                    <div className="item-image-container me-3">
                      <img
                        src={item.image || "https://via.placeholder.com/100"}
                        alt={item.name}
                        className="item-image"
                      />
                    </div>
                    <div className="item-details flex-grow-1">
                      <p className="mb-1"><strong>{item.name}</strong></p>
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
            className="w-50 mt-3"
            onClick={handleConfirmOrder}
            disabled={cartItems.length === 0}
          />
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
          color: var(--primary-text);
          margin-bottom: 1.5rem;
        }
        h5 {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 600;
          color: var(--primary-text);
        }
        h6 {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          font-weight: 600;
          color: var(--primary-text);
        }
        p {
          font-size: clamp(0.85rem, 2vw, 1rem);
          color: var(--secondary-text);
        }
        .text-muted {
          font-size: clamp(0.8rem, 1.8vw, 0.9rem);
          color: var(--placeholder);
        }
        .order-summary {
          background-color: var(--background);
          border: 1px solid var(--dropdown-border);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: clamp(1rem, 3vw, 1.5rem);
        }
        .cart-item {
          border-bottom: 1px solid var(--dropdown-border);
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
        .form-control,
        .form-select {
          font-size: clamp(0.85rem, 2vw, 1rem);
          border-radius: 6px;
          border: 1px solid var(--mobile-dropdown-border);
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
          background: linear-gradient(135deg, var(--button-primary-color) 0%, var(--button-hover-color) 100%);
          color: var(--background);
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
  );
};

export default Checkout;