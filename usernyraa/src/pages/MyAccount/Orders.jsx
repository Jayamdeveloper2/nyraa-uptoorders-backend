"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal"
import {
  ViewOrderButton,
  CancelOrderButton,
  InvoiceButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { fetchUserOrders, clearError } from "../../store/orderSlice"
import ImageViewer from "react-simple-image-viewer"

const Orders = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { orders, loading, error, pagination } = useSelector((state) => state.orders)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    itemToDelete: null,
    actionType: "cancel",
    title: "Confirm Order Cancellation",
  })
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    dispatch(fetchUserOrders({ page: currentPage, limit: 10, status: statusFilter }))
  }, [dispatch, currentPage, statusFilter])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
    }
  }, [error, dispatch])

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }

  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isCancelEligible = (order) => {
    return ["pending", "confirmed", "processing"].includes(order.status.toLowerCase())
  }

  const handleCancelPrompt = (orderId) => {
    setModalConfig({
      itemToDelete: orderId,
      actionType: "cancel",
      title: "Confirm Order Cancellation",
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    if (modalConfig.actionType === "cancel" && modalConfig.itemToDelete) {
      try {
        // Call API to cancel order
        const response = await fetch(`http://localhost:5000/api/orders/${modalConfig.itemToDelete}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: "cancelled",
            comment: "Cancelled by customer",
          }),
        })

        if (response.ok) {
          toast.success("Order cancelled successfully!", {
            position: "top-right",
            autoClose: 3000,
          })
          // Refresh orders
          dispatch(fetchUserOrders({ page: currentPage, limit: 10, status: statusFilter }))
        } else {
          const data = await response.json()
          toast.error(data.message || "Failed to cancel order", {
            position: "top-right",
            autoClose: 5000,
          })
        }
      } catch (error) {
        toast.error("Failed to cancel order. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        })
      }
    }
    setShowConfirmModal(false)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
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

  if (loading && orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0 fw-bold">Your Orders</h2>
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-4 my-3 bg-light rounded-4 shadow-sm">
          <h5>No orders found</h5>
          <p className="text-muted">
            {statusFilter ? `No ${statusFilter} orders found.` : "Start shopping to place your first order."}
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order.id} className="col-12">
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div>
                        <h5 className="card-title mb-0 fw-semibold">Order #{order.orderNumber}</h5>
                        <p className="text-muted small mb-0">
                          Placed on {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill px-2 py-1`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="order-details ps-1 mb-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="d-flex mb-2 align-items-center">
                          <img
                            src={item.productImage || "/placeholder.svg?height=80&width=80&text=Product"}
                            alt={item.productName}
                            className="item-image me-2"
                            onClick={() => openImageViewer(item.productImage)}
                            style={{ cursor: "pointer" }}
                          />
                          <div>
                            <p className="mb-0">
                              {item.productName} (x{item.quantity})
                            </p>
                            <p className="text-muted small mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                            {item.variant && (
                              <p className="text-muted small mb-0">
                                {item.variant.color && `Color: ${item.variant.color} `}
                                {item.variant.size && `Size: ${item.variant.size} `}
                                {item.variant.carat && `Carat: ${item.variant.carat}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-muted small mb-0">+{order.items.length - 2} more items</p>
                      )}
                      <p className="fw-semibold mt-2">Total: ₹{Number.parseFloat(order.total).toFixed(2)}</p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <ViewOrderButton onClick={() => navigate(`/account/orders/${order.id}`)} />
                      <InvoiceButton onClick={() => navigate(`/account/invoices/${order.id}`)} />
                      {isCancelEligible(order) && <CancelOrderButton onClick={() => handleCancelPrompt(order.id)} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${pagination.page === index + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagination.page === pagination.totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
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
          font-size: 0.75rem;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .form-select-sm {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }
        .pagination .page-link {
          color: #c5a47e;
          border-color: #c5a47e;
        }
        .pagination .page-item.active .page-link {
          background-color: #c5a47e;
          border-color: #c5a47e;
        }
        .pagination .page-link:hover {
          color: #b58963;
          border-color: #b58963;
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
            width: 60px;
            height: 60px;
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
            width: 50px;
            height: 50px;
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
  )
}

export default Orders
