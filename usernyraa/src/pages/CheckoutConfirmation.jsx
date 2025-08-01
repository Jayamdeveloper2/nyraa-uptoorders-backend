"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import PopupNotificationWrapper from "../components/PopupNotificationWrapper/PopupNotificationWrapper"
import { clearLastCreatedOrder } from "../store/orderSlice"

const UpdatedCheckoutConfirmation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { lastCreatedOrder } = useSelector((state) => state.orders)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (lastCreatedOrder && lastCreatedOrder.items && lastCreatedOrder.items.length > 0) {
      setShowPopup(true)
    } else {
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
      <div className="confirmation-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="confirmation-container">
      <div className="success-header">
        <div className="checkmark">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been successfully placed.</p>
        <div className="order-number">Order #{lastCreatedOrder.orderNumber}</div>
      </div>

      <div className="confirmation-content">
        <div className="main-section">
          <div className="section">
            <h3>🛍️ Order Summary</h3>
            <div className="order-items">
              {lastCreatedOrder.items.map((item, index) => (
                <div key={item.id || index} className="order-item">
                  <img
                    src={item.productImage || item.image || "/placeholder.svg?height=80&width=80&text=Product"}
                    alt={item.productName || item.name}
                  />
                  <div className="item-details">
                    <h6>{item.productName || item.name}</h6>
                    {item.variant && (
                      <div className="variants">
                        {item.variant.color && <span>Color: {item.variant.color}</span>}
                        {item.variant.size && <span>Size: {item.variant.size}</span>}
                        {item.variant.carat && <span>Carat: {item.variant.carat}</span>}
                      </div>
                    )}
                    <div className="pricing">
                      <span>Qty: {item.quantity}</span>
                      <span>₹{Number.parseFloat(item.price).toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="item-total">₹{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{Number.parseFloat(lastCreatedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>₹{Number.parseFloat(lastCreatedOrder.shipping).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>₹{Number.parseFloat(lastCreatedOrder.tax).toFixed(2)}</span>
              </div>
              {Number.parseFloat(lastCreatedOrder.discount) > 0 && (
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-₹{Number.parseFloat(lastCreatedOrder.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="total-row final">
                <span>Total</span>
                <span>₹{Number.parseFloat(lastCreatedOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="section">
            <h3>🚚 Shipping Details</h3>
            <div className="shipping-info">
              <div className="address">
                <strong>{lastCreatedOrder.shippingAddress.name}</strong>
                <p>{lastCreatedOrder.shippingAddress.street}</p>
                <p>
                  {lastCreatedOrder.shippingAddress.city}, {lastCreatedOrder.shippingAddress.state}{" "}
                  {lastCreatedOrder.shippingAddress.zip}
                </p>
                <p>{lastCreatedOrder.shippingAddress.country}</p>
                <p>📞 {lastCreatedOrder.shippingAddress.phone}</p>
              </div>

              <div className="payment-info">
                <strong>Payment Method</strong>
                <p>
                  💳{" "}
                  {lastCreatedOrder.paymentMethod
                    ? lastCreatedOrder.paymentMethod.replace(/([A-Z])/g, " $1").trim()
                    : "Not specified"}
                </p>
              </div>

              {lastCreatedOrder.specialInstructions && (
                <div className="instructions">
                  <strong>Special Instructions</strong>
                  <p>{lastCreatedOrder.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <h3>📅 Estimated Delivery</h3>
            <div className="delivery-info">
              <p className="delivery-date">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="delivery-note">We'll send tracking info once shipped.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn-primary" onClick={handleViewOrders}>
          View Orders
        </button>
        <button className="btn-outline" onClick={handleExploreCollections}>
          Continue Shopping
        </button>
      </div>

      {showPopup && lastCreatedOrder.items.length > 0 && (
        <PopupNotificationWrapper
          orderItem={{
            ...lastCreatedOrder.items[0],
            name: lastCreatedOrder.items[0].productName || lastCreatedOrder.items[0].name,
            image: lastCreatedOrder.items[0].productImage || lastCreatedOrder.items[0].image,
          }}
          onClose={handlePopupClose}
        />
      )}

      <style jsx>{`
        .confirmation-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .loading {
          text-align: center;
          padding: 4rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #28a745;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-header {
          text-align: center;
          background: white;
          border-radius: 12px;
          padding: 3rem 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        .checkmark {
          width: 80px;
          height: 80px;
          background: #28a745;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0 auto 1.5rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .success-header h1 {
          font-size: 2.5rem;
          font-weight: 300;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .success-header p {
          color: #6c757d;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .order-number {
          background: #007bff;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 1.1rem;
          display: inline-block;
        }

        .confirmation-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        .section h3 {
          font-size: 1.3rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .order-items {
          margin-bottom: 1.5rem;
        }

        .order-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-details h6 {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .variants {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .variants span {
          background: #f8f9fa;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #6c757d;
        }

        .pricing {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #6c757d;
        }

        .item-total {
          font-weight: 600;
          color: #007bff;
          align-self: center;
        }

        .totals {
          border-top: 1px solid #f0f0f0;
          padding-top: 1rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .total-row.discount {
          color: #28a745;
        }

        .total-row.final {
          font-size: 1.2rem;
          font-weight: 600;
          padding-top: 0.5rem;
          border-top: 1px solid #f0f0f0;
          margin-top: 0.5rem;
        }

        .shipping-info > div {
          margin-bottom: 1.5rem;
        }

        .shipping-info strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .shipping-info p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .delivery-info {
          text-align: center;
        }

        .delivery-date {
          font-size: 1.1rem;
          font-weight: 600;
          color: #007bff;
          margin-bottom: 0.5rem;
        }

        .delivery-note {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .actions {
          text-align: center;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
        }

        @media (max-width: 768px) {
          .confirmation-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .success-header {
            padding: 2rem 1rem;
          }
          
          .success-header h1 {
            font-size: 2rem;
          }
          
          .checkmark {
            width: 60px;
            height: 60px;
            font-size: 2rem;
          }
          
          .section {
            padding: 1.5rem;
          }
          
          .order-item {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .order-item img {
            width: 100px;
            height: 100px;
            align-self: center;
          }
          
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-primary, .btn-outline {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  )
}

export default UpdatedCheckoutConfirmation
