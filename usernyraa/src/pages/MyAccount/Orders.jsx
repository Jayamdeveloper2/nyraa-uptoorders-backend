// src/components/Orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal";
import { ViewOrderButton, CancelOrderButton, InvoiceButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import { getOrders, updateOrderStatus } from '../../data/profileData';
import ImageViewer from 'react-simple-image-viewer';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(getOrders());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    itemToDelete: null,
    actionType: 'cancel',
    title: 'Confirm Order Cancellation'
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsViewerOpen(true);
  };

  const closeImageViewer = () => {
    setCurrentImage(null);
    setIsViewerOpen(false);
  };

  const isCancelEligible = (order) => {
    return ["Pending", "Processing"].includes(order.status);
  };

  const handleCancelPrompt = (orderId) => {
    setModalConfig({
      itemToDelete: orderId,
      actionType: 'cancel',
      title: 'Confirm Order Cancellation'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (modalConfig.actionType === 'cancel' && modalConfig.itemToDelete) {
      const updatedOrders = updateOrderStatus(modalConfig.itemToDelete, "Cancelled");
      setOrders(updatedOrders);
      toast.success('Order cancelled successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setShowConfirmModal(false);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="orders-container">
      <h2 className="mb-4 fw-bold">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-4 my-3 bg-light rounded-4 shadow-sm">
          <h5>No orders found</h5>
          <p className="text-muted">Start shopping to place your first order.</p>
        </div>
      ) : (
        <div className="row g-3">
          {orders.map((order) => (
            <div key={order.id} className="col-12">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <div>
                      <h5 className="card-title mb-0 fw-semibold">Order #{order.id}</h5>
                      <p className="text-muted small mb-0">
                        Placed on {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'} rounded-pill px-2 py-1`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="order-details ps-1 mb-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="d-flex mb-2 align-items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image me-2"
                          onClick={() => openImageViewer(item.image)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <p className="mb-0">{item.name} (x{item.quantity})</p>
                          <p className="text-muted small mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-muted small mb-0">+{order.items.length - 2} more items</p>
                    )}
                    <p className="fw-semibold mt-2">Total: ₹{order.total}</p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <ViewOrderButton
                      onClick={() => navigate(`/account/orders/${order.id}`)}
                    />
                    <InvoiceButton
                      onClick={() => navigate(`/account/invoices/${order.id}`)}
                    />
                    {isCancelEligible(order) && (
                      <CancelOrderButton
                        onClick={() => handleCancelPrompt(order.id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Cancel Order"
      />

      {isViewerOpen && (
        <ImageViewer
          src={[currentImage]}
          currentIndex={0}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
          backgroundStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999
          }}
        />
      )}

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
        .orders-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
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
        p {
          font-size: 0.9rem;
          color: #333;
        }
        .card {
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
        }
        .item-image {
         width: 80px;
            height: 100%;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.2s;
        }
        .item-image:hover {
          transform: scale(1.05);
        }
        .text-muted {
          font-size: 0.85rem;
          color: #666;
        }
        .badge {
          font-size: 0.75rem;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .orders-container {
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
          .item-image {
          width: 80px;
            height: 100%;
          }
          .badge {
            font-size: 0.7rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .orders-container {
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
          .item-image {
          width: 80px;
            height: 100%;
          }
          .badge {
            font-size: 0.65rem;
          }
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
          
  .d-flex.gap-2 {
    gap: 0.75rem;
  }
        }
      `}</style>
      
    </div>
  );  
};

export default Orders;