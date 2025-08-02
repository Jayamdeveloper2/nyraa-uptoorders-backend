// src/components/InvoiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import { DownloadPDFButton, BackButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import { getOrders } from '../../data/profileData';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = getOrders();
    const foundOrder = orders.find((o) => o.id === invoiceId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      navigate("/account/invoices");
    }
  }, [invoiceId, navigate]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${order.id}`, 20, 30);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 40);
    doc.text(`Status: ${order.status}`, 20, 50);

    doc.text("Shipping Address:", 20, 60);
    doc.text(`${order.shippingAddress.name}`, 20, 70);
    doc.text(
      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
      20,
      80
    );
    doc.text(`${order.shippingAddress.country}`, 20, 90);

    doc.text("Items:", 20, 100);
    let y = 110;
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

    doc.save(`invoice_${order.id}.pdf`);
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="invoice-container">
      <h2 className="mb-4">Invoice #{order.id}</h2>
      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="mb-4">
          <h5>Order Details</h5>
          <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
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
            <div key={item.id} className="d-flex justify-content-between mb-2">
              <p>{item.name} (x{item.quantity})</p>
              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
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
          <BackButton onClick={() => navigate("/account/orders")} />
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
        .invoice-container {
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
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .invoice-container {
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
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .invoice-container {
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

export default InvoiceDetail;