import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWishlist } from "../store/wishlistSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PromoNavButton, ViewDetailsButton, RemoveWishlistButton } from "../components/ui/Buttons";
import ConfirmationModal from "../components/ui/ConfirmationModal";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    itemToRemove: null,
    actionType: 'removeWishlist',
    title: 'Confirm Removal'
  });

  const handleViewDetails = (item) => {
    navigate(`/product/${item.id}`, {
      state: { product: item },
    });
  };

  const handleRemovePrompt = (item) => {
    setModalConfig({
      itemToRemove: item,
      actionType: 'removeWishlist',
      title: 'Confirm Removal'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    const { itemToRemove, actionType } = modalConfig;
    
    if (actionType === 'removeWishlist' && itemToRemove) {
      dispatch(removeFromWishlist(itemToRemove.id));
      toast.success("Item removed from wishlist successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setShowConfirmModal(false);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="wishlist-container">
      <h1 className="page-title">Your Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty.</p>
          <PromoNavButton
            label="Continue Shopping"
            onClick={() => navigate("/")}
            className="mt-2"
          />
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlistItems.map((item) => (
            <div className="wishlist-item" key={item.id}>
              <div className="item-image">
                <img
                  src={item.image || "https://via.placeholder.com/100"}
                  alt={item.name}
                />
              </div>
              <div className="item-details">
                <h5>{item.name}</h5>
                <p className="price">₹{item.price.toFixed(0)}</p>
                <p className="product-id">Product ID: {item.id}</p>
                {item.color && <p className="color">Color: {item.color}</p>}
              </div>
              <div className="item-actions">
                <ViewDetailsButton
                  label="View Details"
                  productId={item.id}
                  onClick={() => handleViewDetails(item)}
                  className="me-2"
                />
                <RemoveWishlistButton
                  productId={item.id}
                  onClick={() => handleRemovePrompt(item)}
                />
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
        itemName={modalConfig.itemToRemove?.name || ''}
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
        .wishlist-container {
          font-family: 'Open Sans', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #222;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .empty-wishlist {
          text-align: center;
          padding: 2rem 0;
        }

        .empty-wishlist p {
          font-size: 1rem;
          color: #555;
          margin-bottom: 1.25rem;
        }

        .wishlist-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .wishlist-item {
          display: flex;
          flex-wrap: wrap;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          background-color: #fff;
          position: relative;
        }

        .item-image {
          width: 100px;
          flex-shrink: 0;
          margin-right: 1rem;
        }

        .item-image img {
          width: 100%;
          height: auto;
          border-radius: 4px;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-details h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
          margin: 0 0 0.5rem 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-details .price {
          font-size: 1rem;
          font-weight: 500;
          color: #c5a47e;
          margin-bottom: 0.25rem;
        }

        .item-details .product-id,
        .item-details .color {
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 0.25rem;
        }

        .item-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          width: 100%;
        }

        @media (min-width: 576px) and (max-width: 767px) {
          .wishlist-item {
            display: flex;
            flex-wrap: nowrap;
          }

          .item-image {
            width: 80px;
          }

          .item-actions {
            justify-content: center;
            flex-direction: row;
            gap: 0.75rem;
          }
        }

        @media (min-width: 768px) {
          .page-title {
            font-size: 2rem;
            margin-bottom: 2rem;
          }

          .wishlist-item {
            flex-wrap: nowrap;
            align-items: center;
          }

          .item-image {
            width: 120px;
          }

          .item-details {
            padding-right: 1rem;
          }

          .item-actions {
            width: auto;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            margin-top: 0;
            margin-left: auto;
            gap: 1rem;
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 1.4rem;
          }

          .item-image {
            width: 80px;
          }

          .item-details h5 {
            font-size: 1rem;
          }

          .item-details .price,
          .item-details .product-id,
          .item-details .color {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;