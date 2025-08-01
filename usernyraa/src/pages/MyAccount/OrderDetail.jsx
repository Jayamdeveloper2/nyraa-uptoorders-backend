"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import {
  DownloadPDFButton,
  BackButton,
  TrackOrderButton,
  ReturnOrderButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { fetchOrder, clearError } from "../../store/orderSlice"
import ImageViewer from "react-simple-image-viewer"

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders)
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId))
    }
  }, [dispatch, orderId])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
      // Redirect to orders page if order not found
      if (error.includes("not found")) {
        navigate("/account/orders")
      }
    }
  }, [error, dispatch, navigate])

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }

  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isReturnEligible = () => {
    if (!order || order.status.toLowerCase() !== "delivered" || !order.deliveryDate) {
      return false
    }
    const deliveryDate = new Date(order.deliveryDate)
    const currentDate = new Date()
    if (isNaN(deliveryDate.getTime())) {
      console.warn(`Invalid deliveryDate for order ${order.id}: ${order.deliveryDate}`)
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

    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber}`, 20, 60)
    }

    doc.text("Shipping Address:", 20, 70)
    const address = order.shippingAddress
    doc.text(`${address.name}`, 20, 80)
    doc.text(`${address.street}`, 20, 90)
    doc.text(`${address.city}, ${address.state} ${address.zip}`, 20, 100)
    doc.text(`${address.country}`, 20, 110)
    doc.text(`Phone: ${address.phone}`, 20, 120)

    doc.text("Items:", 20, 130)
    let y = 140
    order.items.forEach((item) => {
      doc.text(`${item.productName} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`, 20, y)
      if (item.variant && (item.variant.color || item.variant.size || item.variant.carat)) {
        y += 10
        const variants = []
        if (item.variant.color) variants.push(`Color: ${item.variant.color}`)
        if (item.variant.size) variants.push(`Size: ${item.variant.size}`)
        if (item.variant.carat) variants.push(`Carat: ${item.variant.carat}`)
        doc.text(`  ${variants.join(", ")}`, 20, y)
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

    if (order.specialInstructions) {
      doc.text(`Special Instructions: ${order.specialInstructions}`, 20, y + 60)
    }

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

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "delivered":
        return "bg-success"
      case "cancelled":
      case "refunded":
        return "bg-danger"
      case "shipped":
        return "bg-info"
      case "processing":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
  }

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-5">
          <h5>Order not found</h5>
          <p className="text-muted">The order you're looking for doesn't exist or you don't have access to it.</p>
          <BackButton onClick={() => navigate("/account/orders")} />
        </div>
      </div>
    )
  }

  return (
    <div className="order-detail-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">Order #{order.orderNumber}</h2>
        <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill px-3 py-2`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5>Order Details</h5>
            <p>
              <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod ? order.paymentMethod.replace(/([A-Z])/g, " $1").trim() : "Not specified"}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              {order.paymentStatus
                ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                : "Pending"}
            </p>
            {order.trackingNumber && (
              <p>
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </p>
            )}
            {order.deliveryDate && (
              <p>
                <strong>Delivered On:</strong> {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="col-md-6 mb-4">
            <h5>Shipping Address</h5>
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p>
              <strong>Phone:</strong> {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        {order.specialInstructions && (
          <div className="mb-4">
            <h5>Special Instructions</h5>
            <p className="text-muted">{order.specialInstructions}</p>
          </div>
        )}

        <div className="mb-4">
          <h5>Items ({order.items.length})</h5>
          {order.items.map((item) => (
            <div key={item.id} className="d-flex mb-3 align-items-start border-bottom pb-3">
              <img
                src={item.productImage || "/placeholder.svg?height=80&width=80&text=Product"}
                alt={item.productName}
                className="item-image me-3"
                onClick={() => openImageViewer(item.productImage)}
                style={{ cursor: "pointer" }}
              />
              <div className="flex-grow-1">
                <p className="mb-1">
                  <strong>{item.productName}</strong> (x{item.quantity})
                </p>
                {item.variant && (item.variant.color || item.variant.size || item.variant.carat) && (
                  <p className="mb-1 text-muted small">
                    {item.variant.color && `Color: ${item.variant.color} `}
                    {item.variant.size && `Size: ${item.variant.size} `}
                    {item.variant.carat && `Carat: ${item.variant.carat}`}
                  </p>
                )}
                <p className="mb-0">
                  ₹{Number.parseFloat(item.price).toFixed(2)} each = ₹
                  {(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h5>Order Summary</h5>
          <div className="row">
            <div className="col-md-6 offset-md-6">
              <div className="d-flex justify-content-between mb-2">
                <p>Subtotal</p>
                <p>₹{Number.parseFloat(order.subtotal).toFixed(2)}</p>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <p>Shipping</p>
                <p>₹{Number.parseFloat(order.shipping).toFixed(2)}</p>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <p>Tax</p>
                <p>₹{Number.parseFloat(order.tax).toFixed(2)}</p>
              </div>
              {Number.parseFloat(order.discount) > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <p>Discount</p>
                  <p className="text-success">-₹{Number.parseFloat(order.discount).toFixed(2)}</p>
                </div>
              )}
              <div className="d-flex justify-content-between border-top pt-2">
                <h6>
                  <strong>Total</strong>
                </h6>
                <h6>
                  <strong>₹{Number.parseFloat(order.total).toFixed(2)}</strong>
                </h6>
              </div>
            </div>
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
          width: 80px;
          height: 80px;
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
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .border-bottom {
          border-bottom: 1px solid #dee2e6 !important;
        }
        .border-top {
          border-top: 1px solid #dee2e6 !important;
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
            width: 60px;
            height: 60px;
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
            width: 50px;
            height: 50px;
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
  )
}

export default OrderDetail
