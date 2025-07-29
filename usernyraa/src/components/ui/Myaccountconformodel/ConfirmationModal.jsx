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
  actionType = "default" // 'signout', 'deleteAddress', 'cancelOrder', etc.
}) => {
  // Determine the appropriate message based on actionType and itemName
  const getModalMessage = () => {
    switch (actionType) {
      case 'signout':
        return <p>Are you sure you want to sign out?</p>;
      case 'deleteAddress':
        return <p>Are you sure you want to delete this address?</p>;
      case 'cancelOrder':
        return <p>Are you sure you want to cancel this order?</p>;
      default:
        return <p>{message}</p>;
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #BE6992 0%, #D47A9D 100%)', color: '#fff' }}>
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
            background: 'linear-gradient(135deg, #D47A9D 0%, #BE6992 100%)',
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