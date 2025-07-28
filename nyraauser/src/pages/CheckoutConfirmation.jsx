"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PromoNavButton, BuyNowButton } from "../components/ui/Buttons"
import IconLink from "../components/ui/Icons"
import PopupNotificationWrapper from "../components/PopupNotificationWrapper/PopupNotificationWrapper"

const CheckoutConfirmation = () => {
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Get order details from localStorage (set during checkout)
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"))
    if (lastOrder) {
      setOrderDetails(lastOrder)
      setShowPopup(true)
      // Clear the stored order after displaying
      setTimeout(() => {
        localStorage.removeItem("lastOrder")
      }, 5000)
    } else {
      // If no order found, redirect to orders page
      navigate("/account/orders")
    }
  }, [navigate])

  const handlePopupClose = () => {
    setShowPopup(false)
  }

  if (!orderDetails) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading order confirmation...</p>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <IconLink iconType="guarantee" isSupport={true} className="guarantee-icon mb-3" />
        <h1 className="mb-2">Order Confirmation</h1>
        <p className="mb-4">Thank you for your order! Your order has been successfully placed.</p>
        <div className="alert alert-success" role="alert">
          <strong>Order #{orderDetails.id}</strong> has been confirmed and will be processed shortly.
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card border-0 shadow-lg rounded-4 mb-4">
            <div className="card-header bg-gradient text-white">
              <h5 className="card-title mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="order-items mt-3">
                {orderDetails.items.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom"
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={item.image || "https://via.placeholder.com/60"}
                        alt={item.name}
                        className="item-image me-3"
                      />
                      <div>
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-muted small mb-0">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                        {(item.color || item.carat) && (
                          <p className="text-muted small mb-0">
                            {item.color && `Color: ${item.color}`}
                            {item.carat && ` | Carat: ${item.carat}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 fw-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{orderDetails.subtotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>₹{orderDetails.shipping}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>₹{orderDetails.tax}</span>
                </div>
                {Number.parseFloat(orderDetails.discount) > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount:</span>
                    <span>-₹{orderDetails.discount}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span>₹{orderDetails.total}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-lg rounded-4 mb-4">
            <div className="card-header bg-gradient text-white">
              <h5 className="card-title mb-0">Shipping Information</h5>
            </div>
            <div className="card-body">
              <div className="shipping-address">
                <h6 className="mb-2">Delivery Address</h6>
                <p className="mb-1">
                  <strong>{orderDetails.shippingAddress.name}</strong>
                </p>
                <p className="mb-1">{orderDetails.shippingAddress.street}</p>
                <p className="mb-1">
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{" "}
                  {orderDetails.shippingAddress.zip}
                </p>
                <p className="mb-1">{orderDetails.shippingAddress.country}</p>
                <p className="mb-2">
                  <strong>Phone:</strong> {orderDetails.shippingAddress.phone}
                </p>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Payment Method:</strong>{" "}
                      {orderDetails.paymentMethod
                        ? orderDetails.paymentMethod.replace(/([A-Z])/g, " $1").trim()
                        : "Credit Card"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Order Date:</strong> {new Date(orderDetails.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {orderDetails.specialInstructions && (
                  <div className="mt-3">
                    <p className="mb-1">
                      <strong>Special Instructions:</strong>
                    </p>
                    <p className="text-muted">{orderDetails.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <PromoNavButton label="Continue Shopping" onClick={() => navigate("/collections")} />
              <BuyNowButton label="View My Orders" onClick={() => navigate("/account/orders")} />
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <p className="mb-2 fw-bold">What's Next?</p>
              <p className="mb-1 small">• You'll receive an email confirmation shortly</p>
              <p className="mb-1 small">• We'll notify you when your order ships</p>
              <p className="mb-0 small">• Track your order anytime in "My Orders"</p>
            </div>
          </div>
        </div>
      </div>

      {showPopup && orderDetails.items.length > 0 && (
        <PopupNotificationWrapper orderItem={orderDetails.items[0]} onClose={handlePopupClose} />
      )}

      <style jsx>{`
        .container {
          padding: 0 16px;
          font-family: 'Open Sans', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #222;
        }
        h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }
        h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
        }
        .text-muted {
          font-size: 0.85rem;
          color: #666;
        }
        .card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header.bg-gradient {
          background: linear-gradient(135deg, #C5A47E 0%, #b58963 100%);
          border-radius: 12px 12px 0 0;
        }
        .guarantee-icon {
          font-size: 3rem;
          color: #c5a47e;
        }
        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }
        .alert-success {
          background-color: #d1edff;
          border-color: #b8daff;
          color: #004085;
        }
        .d-flex.gap-3 {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        @media (max-width: 768px) {
          .container {
            padding: 0 12px;
          }
          h1 {
            font-size: 1.5rem;
          }
          h5 {
            font-size: 1rem;
          }
          h6 {
            font-size: 0.95rem;
          }
          p {
            font-size: 0.85rem;
          }
          .text-muted {
            font-size: 0.8rem;
          }
          .guarantee-icon {
            font-size: 2.5rem;
          }
          .item-image {
            width: 50px;
            height: 50px;
          }
          .d-flex.gap-3 {
            gap: 10px;
            flex-direction: column;
            align-items: center;
          }
        }
        @media (max-width: 576px) {
          .container {
            padding: 0 10px;
          }
          h1 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          h6 {
            font-size: 0.9rem;
          }
          p {
            font-size: 0.8rem;
          }
          .text-muted {
            font-size: 0.75rem;
          }
          .guarantee-icon {
            font-size: 2rem;
          }
          .item-image {
            width: 45px;
            height: 45px;
          }
        }
      `}</style>
    </div>
  )
}

export default CheckoutConfirmation
