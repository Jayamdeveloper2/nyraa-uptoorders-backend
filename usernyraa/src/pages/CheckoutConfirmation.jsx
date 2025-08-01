"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { PromoNavButton, BuyNowButton } from "../components/ui/Buttons"
import IconLink from "../components/ui/Icons"
import PopupNotificationWrapper from "../components/PopupNotificationWrapper/PopupNotificationWrapper"
import { clearLastCreatedOrder } from "../store/orderSlice"

const CheckoutConfirmation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { lastCreatedOrder } = useSelector((state) => state.orders)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (lastCreatedOrder && lastCreatedOrder.items && lastCreatedOrder.items.length > 0) {
      setShowPopup(true)
    } else {
      // If no order found, redirect to home
      navigate("/")
    }
  }, [lastCreatedOrder, navigate])

  const handlePopupClose = () => {
    setShowPopup(false)
  }

  const handleViewOrders = () => {
    dispatch(clearLastCreatedOrder())
    navigate("/account/orders")
  }

  const handleExploreCollections = () => {
    dispatch(clearLastCreatedOrder())
    navigate("/collections/dresses")
  }

  if (!lastCreatedOrder) {
    return (
      <div className="container my-5 text-center">
        <p>No order found. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <IconLink iconType="guarantee" isSupport={true} className="guarantee-icon mb-3" />
        <h1 className="mb-2">Order Confirmation</h1>
        <p className="mb-4">Thank you for your order! Your order has been successfully placed.</p>
        <div className="order-number mb-3">
          <strong>Order Number: {lastCreatedOrder.orderNumber}</strong>
        </div>
      </div>

      <div className="order-details mb-4">
        <h5>Order Summary</h5>
        <div className="order-items mt-3">
          {lastCreatedOrder.items.map((item) => (
            <div key={item.id} className="d-flex justify-content-between mb-2">
              <div>
                <p className="mb-0">
                  {item.productName} (x{item.quantity})
                </p>
                <p className="text-muted small">₹{Number.parseFloat(item.price).toFixed(2)} each</p>
                {item.variant && (
                  <p className="text-muted small">
                    {item.variant.color && `Color: ${item.variant.color} `}
                    {item.variant.size && `Size: ${item.variant.size} `}
                    {item.variant.carat && `Carat: ${item.variant.carat}`}
                  </p>
                )}
              </div>
              <p>₹{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="d-flex justify-content-between">
            <p>Subtotal</p>
            <p>₹{Number.parseFloat(lastCreatedOrder.subtotal).toFixed(2)}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Shipping</p>
            <p>₹{Number.parseFloat(lastCreatedOrder.shipping).toFixed(2)}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Tax</p>
            <p>₹{Number.parseFloat(lastCreatedOrder.tax).toFixed(2)}</p>
          </div>
          {Number.parseFloat(lastCreatedOrder.discount) > 0 && (
            <div className="d-flex justify-content-between">
              <p>Discount</p>
              <p>-₹{Number.parseFloat(lastCreatedOrder.discount).toFixed(2)}</p>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <h6>Total</h6>
            <h6>₹{Number.parseFloat(lastCreatedOrder.total).toFixed(2)}</h6>
          </div>
        </div>
      </div>

      <div className="shipping-details mb-4">
        <h5>Shipping Information</h5>
        <p className="mb-1">{lastCreatedOrder.shippingAddress.name}</p>
        <p className="mb-1">{lastCreatedOrder.shippingAddress.street}</p>
        <p className="mb-1">
          {lastCreatedOrder.shippingAddress.city}, {lastCreatedOrder.shippingAddress.state}{" "}
          {lastCreatedOrder.shippingAddress.zip}
        </p>
        <p className="mb-1">{lastCreatedOrder.shippingAddress.country}</p>
        <p className="mb-1">
          <strong>Phone:</strong> {lastCreatedOrder.shippingAddress.phone}
        </p>
        <p className="mb-1">
          <strong>Payment Method:</strong>{" "}
          {lastCreatedOrder.paymentMethod
            ? lastCreatedOrder.paymentMethod.replace(/([A-Z])/g, " $1").trim()
            : "Not specified"}
        </p>
        <p className="mb-1">
          <strong>Status:</strong> {lastCreatedOrder.status.charAt(0).toUpperCase() + lastCreatedOrder.status.slice(1)}
        </p>
        {lastCreatedOrder.specialInstructions && (
          <p className="mb-1">
            <strong>Special Instructions:</strong> {lastCreatedOrder.specialInstructions}
          </p>
        )}
      </div>

      <div className="d-flex gap-3 justify-content-center">
        <PromoNavButton label="Explore Collections" onClick={handleExploreCollections} />
        <BuyNowButton label="View Orders" onClick={handleViewOrders} />
      </div>

      {showPopup && lastCreatedOrder.items.length > 0 && (
        <PopupNotificationWrapper orderItem={lastCreatedOrder.items[0]} onClose={handlePopupClose} />
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
        .order-number {
          font-size: 1.1rem;
          color: #c5a47e;
          font-weight: 600;
        }
        .guarantee-icon {
          font-size: 3rem;
          color: #c5a47e;
        }
        .d-flex.gap-3 {
          display: flex;
          gap: 15px;
          flex-wrap: nowrap;
          justify-content: center;
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
          .d-flex.gap-3 {
            gap: 10px;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}

export default CheckoutConfirmation
