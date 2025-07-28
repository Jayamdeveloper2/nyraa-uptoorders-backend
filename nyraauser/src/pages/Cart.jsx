import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "../store/cartSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RemoveWishlistButton, QuantityButton, CheckoutButton } from "../components/ui/Buttons";
import ConfirmationModal from '../components/ui/ConfirmationModal';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items) || [];
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    itemToRemove: null,
    actionType: 'remove',
    title: 'Confirm Removal'
  });

  // Scroll to top on mount or route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const updateQuantityHandler = (id, newQuantity) => {
    dispatch(updateQuantity({ id, quantity: Math.max(1, newQuantity) }));
  };

  const handleRemovePrompt = (item) => {
    setModalConfig({
      itemToRemove: item,
      actionType: 'remove',
      title: 'Confirm Removal'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    const { itemToRemove, actionType } = modalConfig;
    
    if (actionType === 'remove' && itemToRemove) {
      dispatch(removeFromCart(itemToRemove.id));
      toast.success("Item removed from cart successfully", {
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

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="cart-wrapper mx-3 mx-md-3 mx-0-mobile">
      <h1 className="page-title">Your Cart</h1>
      
      {/* Desktop view */}
      <div className="cart-table desktop-view">
        <div className="row cart-header-row text-uppercase">
          <div className="col-7 col-md-6">Product</div>
          <div className="col-3 col-md-3 text-center">Quantity</div>
          <div className="col-2 col-md-3 text-end">Total</div>
        </div>
        {cartItems.length === 0 ? (
          <p className="text-center mt-4">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="row cart-item align-items-center py-2">
              <div className="col-7 col-md-6 d-flex align-items-center">
                <img
                  src={item.image || "https://via.placeholder.com/60"}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="product-details">
                  <h5 className="mb-1 text-uppercase">{item.name}</h5>
                  <p className="mb-1">₹{item.price.toFixed(2)}</p>
                  <p className="mb-0">
                    {item.color && `Color: ${item.color} | `}
                    {item.carat && `Carat: ${item.carat}`}
                  </p>
                </div>
              </div>
              <div className="col-3 col-md-3 text-center">
                <div className="quantity-controls">
                  <QuantityButton
                    action="decrement"
                    onClick={() => updateQuantityHandler(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateQuantityHandler(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                  <QuantityButton
                    action="increment"
                    onClick={() => updateQuantityHandler(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  />
                  <RemoveWishlistButton
                    productId={item.id}
                    onClick={() => handleRemovePrompt(item)}
                  />
                </div>
              </div>
              <div className="col-2 col-md-3 text-end">
                <p className="mb-0 text-nowrap">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Mobile view */}
      <div className="mobile-view">
        <div className="mobile-cart-header">
          <div className="product-col">PRODUCT</div>
          <div className="content-col"></div>
          <div className="total-col">TOTAL</div>
        </div>
        
        {cartItems.length === 0 ? (
          <p className="text-center mt-4">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="mobile-cart-item">
              <div className="product-image-container">
                <img
                  src={item.image || "https://via.placeholder.com/60"}
                  alt={item.name}
                  className="mobile-cart-item-image"
                />
              </div>
              
              <div className="product-details">
                <div className="product-name">{item.name}</div>
                <div className="product-price">₹{item.price.toFixed(2)}</div>
                
                <div className="product-attributes">
                  {item.color && <div>Color: {item.color}</div>}
                  {item.carat && <div>Carat: {item.carat}</div>}
                </div>
                
                <div className="quantity-controls-mobile">
                  <QuantityButton
                    action="decrement"
                    onClick={() => updateQuantityHandler(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateQuantityHandler(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                  <QuantityButton
                    action="increment"
                    onClick={() => updateQuantityHandler(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  />
                  <RemoveWishlistButton
                    productId={item.id}
                    onClick={() => handleRemovePrompt(item)}
                  />
                </div>
              </div>
              
              <div className="product-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="cart-footer">
        <div className="mb-3">
          <label className="text-muted">Order special instructions</label>
          <textarea
            className="form-control"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Enter special instructions..."
            rows="3"
          ></textarea>
        </div>
        <div className="text-end">
          <div className="d-flex justify-content-end mb-2">
            <h5 className="me-3">Subtotal</h5>
            <h5>₹{getTotal()}</h5>
          </div>
          <p className="text-muted small mb-3">Taxes and shipping calculated at checkout</p>
          <CheckoutButton />
        </div>
      </div>

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
        .cart-wrapper {
          font-family: 'Open Sans', sans-serif;
          padding: 1rem;
          background-color: var(--background);
          min-height: 100vh;
          overflow-x: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          box-sizing: border-box;
        }

        .mx-0-mobile {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--primary-text);
          text-align: center;
          margin-bottom: 1.5rem;
        }

        /* Desktop View Styles */
        .cart-table {
          width: 100%;
        }

        .cart-header-row {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--secondary-text);
          padding-bottom: 10px;
          border-bottom: 1px solid var(--dropdown-border);
        }

        .cart-item {
          border-bottom: 1px solid var(--dropdown-border);
          padding: 10px 0;
          align-items: center;
        }

        .cart-item-image {
          width: 80px;
          height: 100px;
          object-fit: cover;
          margin-right: 10px;
          border-radius: 4px;
        }

        .product-details {
          overflow-wrap: break-word;
        }

        .quantity-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin: 0.5rem 0;
        }

        .quantity-input {
          width: 50px;
          text-align: center;
          border: 1px solid var(--mobile-dropdown-border);
          border-radius: 2px;
          font-size: 0.85rem;
        }

        /* Mobile View Styles */
        .mobile-view {
          display: none;
        }

        .mobile-cart-header {
          display: grid;
          grid-template-columns: 30% 40% 30%;
          padding: 10px 0;
          border-bottom: 1px solid var(--dropdown-border);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--secondary-text);
        }

        .product-col {
          padding-left: 10px;
        }

        .content-col {
          text-align: center;
        }

        .total-col {
          text-align: right;
          padding-right: 10px;
        }

        .mobile-cart-item {
          display: grid;
          grid-template-columns: 30% 40% 30%;
          padding: 15px 0;
          border-bottom: 1px solid var(--dropdown-border);
          align-items: center;
        }

        .product-image-container {
          padding-left: 8px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .mobile-cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-details {
          overflow-wrap: break-word;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .product-category {
          color: var(--secondary-text);
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .product-name {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .product-price {
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .product-attributes {
          font-size: 0.8rem;
          color: var(--secondary-text);
          margin-bottom: 10px;
        }

        .quantity-controls-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .product-total {
          text-align: right;
          padding-right: 10px;
          font-size: 1rem;
          font-weight: 500;
          color: var(--accent);
        }

        .cart-footer {
          margin-top: 20px;
          padding-bottom: 1rem;
        }

        h5 {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--primary-text);
        }

        p {
          font-size: 0.85rem;
          color: var(--secondary-text);
        }

        .text-muted {
          font-size: 0.8rem;
          color: var(--placeholder);
        }

        .form-control {
          border: 1px solid var(--mobile-dropdown-border);
          font-size: 0.85rem;
          resize: none;
          max-width: 400px;
          margin-top: 5px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .desktop-view {
            display: none;
          }

          .mobile-view {
            display: block;
          }

          .cart-wrapper {
            padding: 0.5rem;
          }

          .page-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .mobile-cart-item-image {
            width: 100%;
            height: auto;
            padding-right: 8px;
          }

          .product-name {
            font-size: 0.8rem;
          }

          .product-price {
            font-size: 0.8rem;
          }

          .product-attributes {
            font-size: 0.7rem;
            margin-bottom: 8px;
          }

          .product-total {
            font-size: 0.9rem;
          }

          .form-control {
            font-size: 0.7rem;
            max-width: 100%;
          }

          .quantity-controls-mobile {
            gap: 0.3rem;
          }

          .quantity-input {
            width: 32px;
            font-size: 0.7rem;
          }

          .cart-footer {
            padding-bottom: 1rem;
          }

          .text-end {
            text-align: center !important;
          }

          .d-flex.justify-content-end {
            justify-content: center !important;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .mobile-cart-item-image {
            width: 100%;
            height: auto;
          }

          .product-category {
            font-size: 0.7rem;
          }

          .product-name {
            font-size: 0.75rem;
          }

          .product-price {
            font-size: 0.75rem;
          }

          .product-attributes {
            font-size: 0.65rem;
          }

          .product-total {
            font-size: 0.8rem;
          }

          .quantity-input {
            width: 30px;
            font-size: 0.65rem;
          }

          .quantity-controls-mobile {
            gap: 0.2rem;
          }

          .form-control {
            font-size: 0.65rem;
          }
          
          .mobile-cart-header, .mobile-cart-item {
            grid-template-columns: 25% 45% 30%;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;