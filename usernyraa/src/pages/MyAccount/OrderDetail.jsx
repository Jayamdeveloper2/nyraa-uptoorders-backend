// src/components/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import { DownloadPDFButton, BackButton, TrackOrderButton, ReturnOrderButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import { getOrders } from '../../data/profileData';
import ImageViewer from 'react-simple-image-viewer';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const orders = getOrders();
    const foundOrder = orders.find((o) => o.id === orderId);
    if (foundOrder) {
      const enhancedOrder = {
        ...foundOrder,
        items: foundOrder.items.map((item) => ({
          ...item,
          image: item.image || "https://via.placeholder.com/100",
          description: `High-quality ${item.name.toLowerCase()} with premium materials.`,
        })),
        estimatedDeliveryDate: new Date(foundOrder.orderDate).setDate(
          new Date(foundOrder.orderDate).getDate() + 7
        ),
      };
      setOrder(enhancedOrder);
    } else {
      navigate("/account/orders");
    }
  }, [orderId, navigate]);

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsViewerOpen(true);
  };

  const closeImageViewer = () => {
    setCurrentImage(null);
    setIsViewerOpen(false);
  };

  const isReturnEligible = () => {
    if (order.status !== "Delivered" || !order.deliveryDate) {
      return false;
    }
    const deliveryDate = new Date(order.deliveryDate);
    const currentDate = new Date();
    if (isNaN(deliveryDate.getTime())) {
      console.warn(`Invalid deliveryDate for order ${order.id}: ${order.deliveryDate}`);
      return false;
    }
    const daysSinceDelivery = (currentDate - deliveryDate) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery <= 30;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Order Details", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Order #: ${order.id}`, 20, 30);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 40);
    doc.text(`Status: ${order.status}`, 20, 50);
    doc.text(`Estimated Delivery: ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}`, 20, 60);

    doc.text("Shipping Address:", 20, 70);
    doc.text(`${order.shippingAddress.name}`, 20, 80);
    doc.text(
      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
      20,
      90
    );
    doc.text(`${order.shippingAddress.country}`, 20, 100);

    doc.text("Items:", 20, 110);
    let y = 120;
    order.items.forEach((item) => {
      doc.text(`${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`, 20, y);
      y += 10;
    });

    doc.text(`Subtotal: ₹${order.subtotal}`, 20, y);
    doc.text(`Shipping: ₹${order.shipping}`, 20, y + 10);
    doc.text(`Tax: ₹${order.tax}`, 20, y + 20);
    if (order.discount > 0) {
      doc.text(`Discount: -₹${order.discount}`, 20, y + 30);
    }
    doc.text(`Total: ₹${order.total}`, 20, y + 40);

    doc.save(`order_${order.id}.pdf`);
  };

  const handleTrackOrder = () => {
    toast.info("Tracking information not available yet.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleReturnOrder = () => {
    if (isReturnEligible()) {
      navigate(`/account/orders/${order.id}/return`);
    } else {
      toast.error("This order is not eligible for return.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-detail-container">
      <h2 className="mb-4">Order #{order.id}</h2>
      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="mb-4">
          <h5>Order Details</h5>
          <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
          <h5>Shipping Address</h5>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
        </div>
        <div className="mb-4">
          <h5>Items</h5>
          {order.items.map((item) => (
            <div key={item.id} className="d-flex mb-3 align-items-start">
              <img
                src={item.image}
                alt={item.name}
                className="item-image me-3"
                onClick={() => openImageViewer(item.image)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <p className="mb-1"><strong>{item.name}</strong> (x{item.quantity})</p>
                <p className="mb-1 text-muted">{item.description}</p>
                <p className="mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h5>Summary</h5>
          <div className="d-flex justify-content-between">
            <p>Subtotal</p>
            <p>₹{order.subtotal}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Shipping</p>
            <p>₹{order.shipping}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>Tax</p>
            <p>₹{order.tax}</p>
          </div>
          {order.discount > 0 && (
            <div className="d-flex justify-content-between">
              <p>Discount</p>
              <p>-₹{order.discount}</p>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <h6>Total</h6>
            <h6>₹{order.total}</h6>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <DownloadPDFButton onClick={downloadPDF} />
          <TrackOrderButton onClick={handleTrackOrder} />
          {isReturnEligible() && <ReturnOrderButton onClick={handleReturnOrder} />}
          <BackButton onClick={() => navigate("/account/orders")} />
        </div>
      </div>

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
        .order-detail-container {
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
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .order-detail-container {
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
          .item-image {
            width: 80px;
            height: 100%;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .order-detail-container {
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
         .item-image {
            width: 80px;
            height: 100%;
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

export default OrderDetail;