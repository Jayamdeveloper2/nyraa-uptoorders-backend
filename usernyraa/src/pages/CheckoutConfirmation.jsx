// src/components/CheckoutConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromoNavButton, BuyNowButton } from "../components/ui/Buttons";
import IconLink from "../components/ui/Icons";
import PopupNotificationWrapper from "../components/PopupNotificationWrapper/PopupNotificationWrapper";
import { getOrders } from '../data/profileData';

const CheckoutConfirmation = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    if (lastOrder) {
      setOrderDetails(lastOrder);
      setShowPopup(true);
    } else {
      const orders = getOrders();
      const recentOrder = orders[orders.length - 1];
      if (recentOrder) {
        setOrderDetails(recentOrder);
        setShowPopup(true);
      }
    }
  }, []);

  if (!orderDetails) {
    return <div className="container my-5 text-center">No order found.</div>;
  }

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <IconLink iconType="guarantee" isSupport={true} className="guarantee-icon mb-3" />
        <h1 className="mb-2">Order Confirmation</h1>
        <p className="mb-4">Thank you for your order! Your order has been successfully placed.</p>
      </div>
      <div className="order-details mb-4">
        <h5>Order Summary</h5>
        <div className="order-items mt-3">
          {orderDetails.items.map((item) => (
            <div key={item.id} className="d-flex justify-content-between mb-2">
              <div>
                <p className="mb-0">{item.name} (x{item.quantity})</p>
                <p className="text-muted small">₹{item.price.toFixed(2)} each</p>
              </div>
              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="d-flex justify-content-between">
            <p>Subtotal</p>
            <p>₹{orderDetails.subtotal}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Shipping</p>
            <p>₹{orderDetails.shipping.toFixed(2)}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Tax</p>
            <p>₹{orderDetails.tax}</p>
          </div>
          {orderDetails.discount > 0 && (
            <div className="d-flex justify-content-between">
              <p>Discount</p>
              <p>-₹{orderDetails.discount}</p>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <h6>Total</h6>
            <h6>₹{orderDetails.total}</h6>
          </div>
        </div>
      </div>
      <div className="shipping-details mb-4">
        <h5>Shipping Information</h5>
        <p className="mb-1">{orderDetails.shippingAddress.name}</p>
        <p className="mb-1">{orderDetails.shippingAddress.street}</p>
        <p className="mb-1">
          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
        </p>
        <p className="mb-1">{orderDetails.shippingAddress.country}</p>
        <p className="mb-1">
          <strong>Phone:</strong> {orderDetails.shippingAddress.phone}
        </p>
        <p className="mb-1">
          <strong>Payment Method:</strong>{" "}
          {orderDetails.paymentMethod
            ? orderDetails.paymentMethod.replace(/([A-Z])/g, " $1").trim()
            : "Not specified"}
        </p>
        {orderDetails.specialInstructions && (
          <p className="mb-1">
            <strong>Special Instructions:</strong> {orderDetails.specialInstructions}
          </p>
        )}
      </div>
      <div className="d-flex gap-3 justify-content-center">
        <PromoNavButton
          label="Explore Collections"
          onClick={() => navigate("/collections/dresses")}
        />
        <BuyNowButton
          label="View Orders"
          onClick={() => navigate("/account/orders")}
        />
      </div>
      {showPopup && orderDetails.items.length > 0 && (
        <PopupNotificationWrapper
          orderItem={orderDetails.items[0]}
          onClose={handlePopupClose}
        />
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
  );
};

export default CheckoutConfirmation;