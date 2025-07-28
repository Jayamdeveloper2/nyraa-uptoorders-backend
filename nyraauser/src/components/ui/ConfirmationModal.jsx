import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  itemName = "",
  actionType = "remove" // 'remove', 'logout', etc.
}) => {
  // Determine the appropriate message based on actionType and itemName
  const getModalMessage = () => {
    switch (actionType) {
      case 'remove':
        return (
          <p>
            Are you sure you want to remove <strong>{itemName}</strong> from your {itemName ? 'cart' : 'cart'}?
          </p>
        );
      case 'logout':
        return <p>Are you sure you want to logout?</p>;
      case 'removeWishlist':
        return (
          <p>
            Are you sure you want to remove <strong>{itemName}</strong> from your wishlist?
          </p>
        );
      default:
        return <p>{message}</p>;
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {getModalMessage()}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          {cancelButtonText}
        </button>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          style={{
            background: 'linear-gradient(135deg, var(--button-primary-color) 0%, var(--button-hover-color) 100%)',
            border: 'none',
          }}
        >
          {confirmButtonText}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  itemName: PropTypes.string,
  actionType: PropTypes.string
};

export default ConfirmationModal;