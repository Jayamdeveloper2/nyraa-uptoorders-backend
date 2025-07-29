import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    SaveIcon,
    CloseIcon,
    Edit2Icon as EditIcon,
    CheckCircleIcon,
    PlusIcon,
    RefreshIcon,
    TrashIcon,
    LogOutIcon,
    ViewIcon,
    InvoiceIcon,
    CancelIcon,
    TrackIcon,
    DownloadIcon,
    ArrowLeftIcon,
    ReturnIcon
} from '../Myaccounticons/MyAccountIcons';

// Common button styles
const buttonBaseStyles = `
  .account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    outline: none;
    padding: 8px 16px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .account-button:hover {
    transform: translateY(-2px);
  }

  .account-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .account-button:focus {
    box-shadow: 0 0 0 3px rgba(212, 122, 157, 0.3);
  }

  .button-icon {
    display: flex;
    align-items: center;
  }

  .icon-only {
    width: 40px;
    height: 40px;
    padding: 0;
  }

  @media (max-width: 768px) {
    .account-button {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
    
    .icon-only {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 576px) {
    .account-button {
      padding: 5px 10px;
      font-size: 0.8rem;
    }
    
    .icon-only {
      width: 32px;
      height: 32px;
    }
  }
`;

const SaveAddressButton = ({ onClick, className, disabled, type = "button" }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        type={type}
        className={`account-button save-button icon-only ${className || ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-label="Save"
      >
        <SaveIcon className="button-icon" />
      </button>
      <style jsx>{`
        .save-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .save-button:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const CancelButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Action cancelled', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button cancel-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Cancel"
      >
        <CloseIcon className="button-icon" />
        <span>Cancel</span>
      </button>
      <style jsx>{`
        .cancel-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .cancel-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const EditAddressButton = ({ onClick, className, addressId }) => {
  const handleClick = () => {
    onClick(addressId);
    toast.info('Editing address', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button edit-button icon-only ${className || ''}`}
        onClick={handleClick}
        aria-label="Edit"
      >
        <EditIcon className="button-icon" />
      </button>
      <style jsx>{`
        .edit-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .edit-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const SignOutButton = ({ onClick, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button signout-button ${className || ''}`}
        onClick={onClick}
        aria-label="Sign Out"
      >
        <LogOutIcon className="button-icon" />
        <span>Sign Out</span>
      </button>
      <style jsx>{`
        .signout-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .signout-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const AddAddressButton = ({ onClick, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button add-address-button ${className || ''}`}
        onClick={onClick}
        aria-label="Add Address"
      >
        <PlusIcon className="button-icon" />
        <span>Add New Address</span>
      </button>
      <style jsx>{`
        .add-address-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .add-address-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const SetDefaultButton = ({ onClick, addressId, className }) => {
  const handleClick = () => {
    onClick(addressId);
    toast.success('Default address set successfully', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button set-default-button icon-only ${className || ''}`}
        onClick={handleClick}
        aria-label="Set Default"
      >
        <CheckCircleIcon className="button-icon" />
      </button>
      <style jsx>{`
        .set-default-button {
          color: #D47A9D;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #D47A9D;
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.2);
        }
        .set-default-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const DeleteAddressButton = ({ onClick, addressId, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button delete-button icon-only ${className || ''}`}
        onClick={() => onClick(addressId)}
        aria-label="Delete Address"
      >
        <TrashIcon className="button-icon" />
      </button>
      <style jsx>{`
        .delete-button {
          color: #fff;
          background: linear-gradient(135deg, #e22222 0%, #eb1e1e 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 122, 0.3);
        }
        .delete-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const ResetButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Form reset', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button reset-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Reset"
      >
        <RefreshIcon className="button-icon" />
        <span>Reset</span>
      </button>
      <style jsx>{`
        .reset-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .reset-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const ViewOrderButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Viewing order details', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button view-button icon-only ${className || ''}`}
        onClick={handleClick}
        aria-label="View Order"
      >
        <ViewIcon className="button-icon" />
      </button>
      <style jsx>{`
        .view-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .view-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const InvoiceButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Viewing invoice', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button invoice-button ${className || ''}`}
        onClick={handleClick}
        aria-label="View Invoice"
      >
        <InvoiceIcon className="button-icon" />
        <span>Invoice</span>
      </button>
      <style jsx>{`
        .invoice-button {
          color: #fff;
          background: linear-gradient(135deg, #6c757d 0%, #5c636a 100%);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }
        .invoice-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
        }
      `}</style>
    </>
  );
};

const CancelOrderButton = ({ onClick, className, orderId }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button cancel-order-button icon-only ${className || ''}`}
        onClick={() => onClick(orderId)}
        aria-label="Cancel Order"
      >
        <CancelIcon className="button-icon" />
      </button>
      <style jsx>{`
        .cancel-order-button {
          color: #fff;
          background: linear-gradient(135deg, #e22222  0%, #eb1e1e  100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .cancel-order-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const TrackOrderButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Tracking order', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button track-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Track Order"
      >
        <TrackIcon className="button-icon" />
        <span>Track Order</span>
      </button>
      <style jsx>{`
        .track-button {
          color: #fff;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        .track-button:hover {
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        }
      `}</style>
    </>
  );
};

const DownloadPDFButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.success('Invoice downloaded successfully', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button download-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Download PDF"
      >
        <DownloadIcon className="button-icon" />
        <span>Download PDF</span>
      </button>
      <style jsx>{`
        .download-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .download-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const BackButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Returning to previous page', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button back-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Back"
      >
        <ArrowLeftIcon className="button-icon" />
        <span>Back</span>
      </button>
      <style jsx>{`
        .back-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .back-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const SubmitReturnButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button submit-return-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Submit Return"
      >
        <ReturnIcon className="button-icon" />
        <span>Submit Return</span>
      </button>
      <style jsx>{`
        .submit-return-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .submit-return-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const ReturnOrderButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Initiating return process', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button return-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Return Order"
      >
        <ReturnIcon className="button-icon" />
        <span>Return</span>
      </button>
      <style jsx>{`
        .return-button {
          color: #D47A9D;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: 1px solid #D47A9D;
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.2);
        }
        .return-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.3);
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
      `}</style>
    </>
  );
};

export {
  SaveAddressButton,
  CancelButton,
  EditAddressButton,
  SignOutButton,
  AddAddressButton,
  SetDefaultButton,
  DeleteAddressButton,
  ResetButton,
  ViewOrderButton,
  InvoiceButton,
  CancelOrderButton,
  TrackOrderButton,
  DownloadPDFButton,
  BackButton,
  SubmitReturnButton,
  ReturnOrderButton
};