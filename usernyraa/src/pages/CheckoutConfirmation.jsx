"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { PromoNavButton, BuyNowButton } from "../components/ui/Buttons"
import IconLink from "../components/ui/Icons"
import PopupNotificationWrapper from "../components/PopupNotificationWrapper/PopupNotificationWrapper"
import { fetchOrderById } from "../store/orderSlice"

const CheckoutConfirmation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { currentOrder, loading } = useSelector((state) => state.orders)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Get order ID from location state or URL params
    const orderId = location.state?.orderId || new URLSearchParams(location.search).get("orderId")

    if (orderId) {
      dispatch(fetchOrderById({ orderId }))
    } else {
      // Fallback to localStorage for backward compatibility
      const lastOrder = JSON.parse(localStorage.getItem("lastOrder"))
      if (lastOrder) {
        // Convert localStorage order format to match API format
        const convertedOrder = {
          id: lastOrder.id,
          orderNumber: lastOrder.id,
          items: lastOrder.items.map((item) => ({
            id: item.id,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            variant: {
              color: item.color,
              carat: item.carat,
            },
          })),
          subtotal: Number.parseFloat(lastOrder.subtotal),
          shipping: lastOrder.shipping,
          tax: Number.parseFloat(lastOrder.tax),
          discount: Number.parseFloat(lastOrder.discount),
          total: Number.parseFloat(lastOrder.total),
          shippingAddress: lastOrder.shippingAddress,
          paymentMethod: lastOrder.paymentMethod,
          specialInstructions: lastOrder.specialInstructions,
          status: lastOrder.status || "pending",
          createdAt: lastOrder.orderDate,
        }
        // Set the order directly in Redux state
        dispatch({ type: "orders/setCurrentOrder", payload: convertedOrder })
      }
    }
  }, [dispatch, location])

  useEffect(() => {
    if (currentOrder) {
      setShowPopup(true)
    }
  }, [currentOrder])

  const handlePopupClose = () => {
    setShowPopup(false)
  }

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="container my-5 text-center">
        <h2>No order found</h2>
        <p>We couldn't find your order details.</p>
        <BuyNowButton label="Go to Orders" onClick={() => navigate("/account/orders")} />
      </div>
    )
  }

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <IconLink iconType="guarantee" isSupport={true} className="guarantee-icon mb-3" />
        <h1 className="mb-2">Order Confirmation</h1>
        <p className="mb-2">Thank you for your order! Your order has been successfully placed.</p>
        <p className="text-muted">
          Order Number: <strong>{currentOrder.orderNumber}</strong>
        </p>
        <p className="text-muted">
          Status:{" "}
          <span className={`badge ${getStatusBadgeClass(currentOrder.status)}`}>
            {currentOrder.status?.toUpperCase()}
          </span>
        </p>
      </div>

      <div className="order-details mb-4">
        <h5>Order Summary</h5>
        <div className="order-items mt-3">
          {currentOrder.items?.map((item, index) => (
            <div
              key={item.id || index}
              className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded"
            >
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <img
                    src={item.productImage || "/placeholder.svg?height=60&width=60"}
                    alt={item.productName || item.name}
                    className="order-item-image"
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <p className="mb-1 fw-bold">{item.productName || item.name}</p>
                  <p className="mb-1 text-muted small">
                    Quantity: {item.quantity} × ₹{Number.parseFloat(item.unitPrice || item.price).toFixed(2)}
                  </p>
                  {item.variant && (
                    <p className="mb-0 text-muted small">
                      {item.variant.color && `Color: ${item.variant.color}`}
                      {item.variant.color && item.variant.carat && " | "}
                      {item.variant.carat && `Carat: ${item.variant.carat}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-end">
                <p className="mb-0 fw-bold">
                  ₹{Number.parseFloat(item.totalPrice || item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between mb-2">
            <p className="mb-0">Subtotal</p>
            <p className="mb-0">₹{Number.parseFloat(currentOrder.subtotal).toFixed(2)}</p>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <p className="mb-0">Shipping</p>
            <p className="mb-0">₹{Number.parseFloat(currentOrder.shipping).toFixed(2)}</p>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <p className="mb-0">Tax</p>
            <p className="mb-0">₹{Number.parseFloat(currentOrder.tax).toFixed(2)}</p>
          </div>
          {currentOrder.discount > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <p className="mb-0">Discount</p>
              <p className="mb-0 text-success">-₹{Number.parseFloat(currentOrder.discount).toFixed(2)}</p>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between">
            <h6 className="mb-0">Total</h6>
            <h6 className="mb-0">₹{Number.parseFloat(currentOrder.total).toFixed(2)}</h6>
          </div>
        </div>
      </div>

      <div className="shipping-details mb-4">
        <h5>Shipping Information</h5>
        <div className="p-3 border rounded">
          <p className="mb-1">
            <strong>{currentOrder.shippingAddress.name}</strong>
          </p>
          <p className="mb-1">{currentOrder.shippingAddress.street}</p>
          <p className="mb-1">
            {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zip}
          </p>
          <p className="mb-1">{currentOrder.shippingAddress.country}</p>
          <p className="mb-1">
            <strong>Phone:</strong> {currentOrder.shippingAddress.phone}
          </p>
          <p className="mb-1">
            <strong>Payment Method:</strong>{" "}
            {currentOrder.paymentMethod
              ? currentOrder.paymentMethod.replace(/([A-Z])/g, " $1").trim()
              : "Not specified"}
          </p>
          {currentOrder.specialInstructions && (
            <p className="mb-1">
              <strong>Special Instructions:</strong> {currentOrder.specialInstructions}
            </p>
          )}
          {currentOrder.trackingNumber && (
            <p className="mb-1">
              <strong>Tracking Number:</strong> {currentOrder.trackingNumber}
            </p>
          )}
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <PromoNavButton label="Continue Shopping" onClick={() => navigate("/collections/dresses")} />
        <BuyNowButton label="View All Orders" onClick={() => navigate("/account/orders")} />
      </div>

      {showPopup && currentOrder.items?.length > 0 && (
        <PopupNotificationWrapper orderItem={currentOrder.items[0]} onClose={handlePopupClose} />
      )}

      <style jsx>{`
        .container {
          padding: 0 16px;
          font-family: 'Open Sans', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          font-size: 1.8rem;
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
        .order-details,
        .shipping-details {
          border: 1px solid #eee;
          padding: 20px;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .guarantee-icon {
          font-size: 3rem;
          color: #c5a47e;
        }
        .d-flex.gap-3 {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .badge {
          font-size: 0.75rem;
          padding: 0.4em 0.8em;
        }
        .order-item-image {
          border: 1px solid #eee;
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
          .order-details,
          .shipping-details {
            padding: 15px;
          }
          .d-flex.gap-3 {
            gap: 10px;
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
          .order-details,
          .shipping-details {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}

// Helper function to get status badge class
const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-warning text-dark"
    case "confirmed":
      return "bg-info"
    case "processing":
      return "bg-primary"
    case "shipped":
      return "bg-secondary"
    case "delivered":
      return "bg-success"
    case "cancelled":
      return "bg-danger"
    case "refunded":
      return "bg-dark"
    default:
      return "bg-secondary"
  }
}

export default CheckoutConfirmation
