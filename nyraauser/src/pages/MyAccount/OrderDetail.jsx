"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import {
  DownloadPDFButton,
  BackButton,
  TrackOrderButton,
  ReturnOrderButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { orderService } from "../../services/orderService"
import ImageViewer from "react-simple-image-viewer"

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const result = await orderService.getOrder(orderId)

      if (result.success) {
        setOrder(result.order)
      } else {
        toast.error("Order not found", {
          position: "top-right",
          autoClose: 3000,
        })
        navigate("/account/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      toast.error(error.message || "Failed to fetch order details", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate("/account/orders")
    } finally {
      setLoading(false)
    }
  }

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }

  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isReturnEligible = () => {
    if (!order || order.status !== "delivered" || !order.actualDeliveryDate) {
      return false
    }
    const deliveryDate = new Date(order.actualDeliveryDate)
    const currentDate = new Date()
    if (isNaN(deliveryDate.getTime())) {
      console.warn(`Invalid deliveryDate for order ${order.id}: ${order.actualDeliveryDate}`)
      return false
    }
    const daysSinceDelivery = (currentDate - deliveryDate) / (1000 * 60 * 60 * 24)
    return daysSinceDelivery <= 30
  }

  const downloadPDF = () => {
    if (!order) return

    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text("Order Details", 20, 20)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Order #: ${order.orderNumber}`, 20, 30)
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 40)
    doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 20, 50)

    if (order.estimatedDeliveryDate) {
      doc.text(`Estimated Delivery: ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}`, 20, 60)
    }

    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber}`, 20, 70)
    }

    doc.text("Shipping Address:", 20, 80)
    doc.text(`${order.shippingAddress.name}`, 20, 90)
    doc.text(
      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
      20,
      100,
    )
    doc.text(`${order.shippingAddress.country}`, 20, 110)
    doc.text(`Phone: ${order.shippingAddress.phone}`, 20, 120)

    doc.text("Items:", 20, 130)
    let y = 140
    order.items.forEach((item) => {
      doc.text(`${item.productName} (x${item.quantity}) - ₹${Number.parseFloat(item.totalPrice).toFixed(2)}`, 20, y)
      if (item.variant && (item.variant.color || item.variant.size)) {
        y += 10
        doc.text(
          `  ${item.variant.color ? `Color: ${item.variant.color}` : ""} ${item.variant.size ? `Size: ${item.variant.size}` : ""}`,
          25,
          y,
        )
      }
      y += 10
    })

    y += 10
    doc.text(`Subtotal: ₹${Number.parseFloat(order.subtotal).toFixed(2)}`, 20, y)
    doc.text(`Shipping: ₹${Number.parseFloat(order.shipping).toFixed(2)}`, 20, y + 10)
    doc.text(`Tax: ₹${Number.parseFloat(order.tax).toFixed(2)}`, 20, y + 20)
    if (Number.parseFloat(order.discount) > 0) {
      doc.text(`Discount: -₹${Number.parseFloat(order.discount).toFixed(2)}`, 20, y + 30)
      y += 10
    }
    doc.text(`Total: ₹${Number.parseFloat(order.total).toFixed(2)}`, 20, y + 40)

    doc.save(`order_${order.orderNumber}.pdf`)
  }

  const handleTrackOrder = () => {
    if (order.trackingNumber) {
      toast.info(`Tracking Number: ${order.trackingNumber}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } else {
      toast.info("Tracking information not available yet.", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const handleReturnOrder = () => {
    if (isReturnEligible()) {
      navigate(`/account/orders/${order.id}/return`)
    } else {
      toast.error("This order is not eligible for return.", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success"
      case "cancelled":
        return "bg-danger"
      case "shipped":
        return "bg-info"
      case "processing":
        return "bg-primary"
      default:
        return "bg-warning"
    }
  }

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-4">
          <h3>Order not found</h3>
          <button className="btn btn-primary" onClick={() => navigate("/account/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-detail-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order #{order.orderNumber}</h2>
        <span className={`badge ${getStatusBadgeClass(order.status)} fs-6 px-3 py-2`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="mb-4">
          <h5>Order Details</h5>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Order Date:</strong> {formatDate(order.orderDate)}
              </p>
              <p>
                <strong>Payment Method:</strong> {order.paymentMethod.replace(/([A-Z])/g, " $1").trim()}
              </p>
              {order.trackingNumber && (
                <p>
                  <strong>Tracking Number:</strong> {order.trackingNumber}
                </p>
              )}
            </div>
            <div className="col-md-6">
              {order.estimatedDeliveryDate && (
                <p>
                  <strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </p>
              )}
              {order.actualDeliveryDate && (
                <p>
                  <strong>Delivered On:</strong> {new Date(order.actualDeliveryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {order.specialInstructions && (
            <p>
              <strong>Special Instructions:</strong> {order.specialInstructions}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h5>Shipping Address</h5>
          <div className="address-card p-3 bg-light rounded">
            <p className="mb-1">
              <strong>{order.shippingAddress.name}</strong>
            </p>
            <p className="mb-1">{order.shippingAddress.street}</p>
            <p className="mb-1">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p className="mb-1">{order.shippingAddress.country}</p>
            <p className="mb-0">
              <strong>Phone:</strong> {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h5>Items ({order.items.length})</h5>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.id} className="item-row d-flex mb-3 p-3 bg-light rounded align-items-start">
                <img
                  src={item.productImage || item.product?.images?.[0] || "https://via.placeholder.com/100"}
                  alt={item.productName}
                  className="item-image me-3"
                  onClick={() =>
                    openImageViewer(item.productImage || item.product?.images?.[0] || "https://via.placeholder.com/100")
                  }
                  style={{ cursor: "pointer" }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.productName}</h6>
                  <p className="mb-1 text-muted">
                    Quantity: {item.quantity} × ₹{Number.parseFloat(item.unitPrice).toFixed(2)}
                  </p>
                  {item.variant && (
                    <p className="mb-1 text-muted small">
                      {item.variant.color && `Color: ${item.variant.color}`}
                      {item.variant.size && ` | Size: ${item.variant.size}`}
                      {item.variant.type && ` | Type: ${item.variant.type}`}
                    </p>
                  )}
                  <p className="mb-0 fw-bold">₹{Number.parseFloat(item.totalPrice).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h5>Order Summary</h5>
          <div className="summary-card p-3 bg-light rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₹{Number.parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping:</span>
              <span>₹{Number.parseFloat(order.shipping).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax:</span>
              <span>₹{Number.parseFloat(order.tax).toFixed(2)}</span>
            </div>
            {Number.parseFloat(order.discount) > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Discount:</span>
                <span>-₹{Number.parseFloat(order.discount).toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total:</span>
              <span>₹{Number.parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mb-4">
            <h5>Order History</h5>
            <div className="timeline">
              {order.statusHistory.map((history, index) => (
                <div key={history.id} className="timeline-item d-flex mb-3">
                  <div className="timeline-marker me-3">
                    <div className="timeline-dot bg-primary"></div>
                    {index < order.statusHistory.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <p className="mb-1 fw-bold">{history.status.charAt(0).toUpperCase() + history.status.slice(1)}</p>
                    <p className="mb-1 text-muted small">{formatDate(history.changedAt)}</p>
                    {history.notes && <p className="mb-0 text-muted small">{history.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap">
          <DownloadPDFButton onClick={downloadPDF} />
          <TrackOrderButton onClick={handleTrackOrder} />
          {isReturnEligible() && <ReturnOrderButton onClick={handleReturnOrder} />}
          <BackButton onClick={() => navigate("/account/orders")} />
        </div>
      </div>

      {isViewerOpen && (
        <ImageViewer
          src={[currentImage] || "/placeholder.svg"}
          currentIndex={0}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
          backgroundStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
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
          margin-bottom: 1rem;
        }
        h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .item-image {
          width: 100px;
          height: 100px;
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
          padding: 8px 16px;
          border-radius: 8px;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .badge {
          font-size: 0.9rem;
        }
        .address-card, .summary-card {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
        }
        .item-row {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          transition: background-color 0.2s;
        }
        .item-row:hover {
          background-color: #e9ecef;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        .timeline-item {
          position: relative;
        }
        .timeline-marker {
          position: relative;
          width: 20px;
          flex-shrink: 0;
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .timeline-line {
          position: absolute;
          left: 50%;
          top: 16px;
          width: 2px;
          height: 40px;
          background-color: #dee2e6;
          transform: translateX(-50%);
        }
        .timeline-content {
          flex-grow: 1;
          padding-left: 1rem;
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
            height: 80px;
          }
          .btn {
            font-size: 0.85rem;
            padding: 6px 12px;
          }
          .d-flex.gap-2 {
            gap: 0.5rem;
          }
          .item-row {
            flex-direction: column;
            text-align: center;
          }
          .item-row .item-image {
            margin: 0 auto 1rem auto;
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
            width: 70px;
            height: 70px;
          }
          .btn {
            font-size: 0.8rem;
            padding: 5px 10px;
            width: 100%;
            margin-right: 0;
          }
          .d-flex.gap-2 {
            flex-direction: column;
            gap: 0.5rem;
          }
          .badge {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}

export default OrderDetail
