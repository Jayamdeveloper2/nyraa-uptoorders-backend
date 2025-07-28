import React, { useCallback, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ViewCartButton, PurchaseNowTwoButton, RemoveWishlistButton } from '../ui/Buttons';
import { updateQuantity, removeFromCart } from '../../store/cartSlice';
import ConfirmationModal from '../ui/ConfirmationModal';
import './CartSidebar.css';

const CartSidebar = ({
  show,
  handleClose,
  navigate,
  specialInstructions,
  setSpecialInstructions,
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items) || [];
  const cartCount = useSelector((state) => state.cart.cartCount) || 0;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    itemToRemove: null,
    actionType: 'remove',
    title: 'Confirm Removal'
  });

  const getTotal = useCallback(() => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  }, [cartItems]);

  const handleQuantityChange = useCallback(
    (id, newQuantity) => {
      const quantity = Math.max(1, parseInt(newQuantity) || 1);
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const handleRemovePrompt = useCallback((item) => {
    setModalConfig({
      itemToRemove: item,
      actionType: 'remove',
      title: 'Confirm Removal'
    });
    setShowConfirmModal(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
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
  }, [dispatch, modalConfig]);

  const handleCancelAction = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="cart-sidebar">
      <Offcanvas.Header className="cart-header d-flex justify-content-between align-items-center">
        <Offcanvas.Title className="fw-bold">Your Cart ({cartCount})</Offcanvas.Title>
        <button
          className="btn-close-custom"
          onClick={handleClose}
          style={{ fontSize: '1.2rem', background: 'none', border: 'none' }}
        >
          ✕
        </button>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="cart-table">
          {cartItems.length === 0 ? (
            <p className="text-center mt-4">Your cart is empty.</p>
          ) : (
            <>
              <div className="row cart-header-row">
                <div className="col-6">PRODUCT</div>
                <div className="col-6 text-end">TOTAL</div>
              </div>
              {cartItems.map((item) => (
                <div key={item.id} className="row cart-item align-items-center mb-3">
                  <div className="col-6 d-flex align-items-center">
                    <img
                      src={item.images ? item.images[0] : item.image || 'https://via.placeholder.com/60x60'}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60';
                      }}
                    />
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="mb-1">₹{item.price.toFixed(2)}</p>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          style={{ padding: '2px 6px' }}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          style={{ width: '50px', textAlign: 'center', margin: '0 8px', fontSize: '0.85rem' }}
                          className="form-control form-control-sm"
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          style={{ padding: '2px 6px' }}
                        >
                          +
                        </button>
                        <RemoveWishlistButton
                          productId={item.id}
                          onClick={() => handleRemovePrompt(item)}
                          className="ms-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="cart-total d-flex justify-content-between">
                <span>Total:</span>
                <span>₹{getTotal()}</span>
              </div>
              <div className="special-instructions">
                <label htmlFor="specialInstructions">Special Instructions:</label>
                <textarea
                  id="specialInstructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Enter any special instructions..."
                />
              </div>
              <div className="cart-action-buttons">
                <ViewCartButton
                  label="View Cart"
                  onClick={() => {
                    handleClose();
                    navigate('/cart');
                  }}
                  showIcon={true}
                />
                <PurchaseNowTwoButton
                  label="Checkout"
                  onClick={() => {
                    handleClose();
                    navigate('/checkout');
                  }}
                  showIcon={true}
                />
              </div>
            </>
          )}
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
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartSidebar;