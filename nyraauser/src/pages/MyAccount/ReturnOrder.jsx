// src/components/ReturnOrder.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SubmitReturnButton, BackButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal";
import { getOrders, updateOrderStatus } from '../../data/profileData';

const ReturnOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const orders = getOrders();
    const foundOrder = orders.find((o) => o.id === orderId);
    if (foundOrder && foundOrder.status === "Delivered") {
      setOrder(foundOrder);
    } else {
      navigate("/account/orders");
    }
  }, [orderId, navigate]);

  const handleSubmitReturn = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmReturn = () => {
    updateOrderStatus(order.id, "Return Requested");
    toast.success("Return request submitted successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    setShowConfirmModal(false);
    navigate("/account/orders");
  };

  const handleCancelReturn = () => {
    setShowConfirmModal(false);
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="return-order-container">
      <h2 className="mb-4">Return Order #{order.id}</h2>
      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="mb-4">
          <h5>Order Summary</h5>
          {order.items.map((item) => (
            <div key={item.id} className="d-flex justify-content-between mb-2">
              <p>{item.name} (x{item.quantity})</p>
              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="d-flex justify-content-between">
            <h6>Total</h6>
            <h6>₹{order.total}</h6>
          </div>
        </div>
        <div className="mb-4">
          <h5>Shipping Address</h5>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
        <div className="mb-4">
          <h5>Return Details</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Return</Form.Label>
              <Form.Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="defective">Defective Item</option>
                <option value="wrong_item">Wrong Item Shipped</option>
                <option value="not_as_described">Not as Described</option>
                <option value="changed_mind">Changed Mind</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Provide any additional details..."
              />
            </Form.Group>
          </Form>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <SubmitReturnButton
            onClick={handleSubmitReturn}
            disabled={!returnReason}
          />
          <BackButton onClick={() => navigate(`/account/orders/${order.id}`)} />
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelReturn}
        onConfirm={handleConfirmReturn}
        title="Confirm Return Request"
        actionType="return"
        confirmButtonText="Submit Return"
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
        .return-order-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
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
        .form-control,
        .form-select {
          font-size: 0.9rem;
          border-radius: 8px;
          border: 1px solid #ced4da;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .return-order-container {
            padding: 1rem 0.75rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
          h6 {
            font-size: 0.9rem;
          }
          p {
            font-size: 0.85rem;
          }
          .form-control,
          .form-select {
            font-size: 0.85rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .return-order-container {
            padding: 0.75rem 0.5rem;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          h6 {
            font-size: 0.85rem;
          }
          p {
            font-size: 0.8rem;
          }
          .form-control,
          .form-select {
            font-size: 0.8rem;
          }
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
          .d-flex.gap-2 {
            flex-direction: column;
            align-items: stretch;
          }
          .d-flex.gap-2 > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReturnOrder;