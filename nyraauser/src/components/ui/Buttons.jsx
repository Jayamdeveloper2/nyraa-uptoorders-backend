import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconLink from './Icons';
import { FaShoppingBag } from 'react-icons/fa';

const PromoNavButton = ({ label = "Shop Now", link, onClick, className, basePath = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      navigate(basePath ? `${basePath}/${link}` : link);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `promo-nav-button ${className}` : 'promo-nav-button'}
      onClick={handleClick}
    >
      {label}
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .promo-nav-button {
          font-size: 14px;
          padding: 5px 10px;
          color: var(--button-primary-color);
          background: none;
          border: none;
          text-decoration: underline;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition);
        }
        .promo-nav-button:hover {
          color: var(--button-hover-color);
        }
        @media (max-width: 768px) {
          .promo-nav-button {
            font-size: 13px;
            padding: 4px 8px;
          }
        }
        @media (max-width: 576px) {
          .promo-nav-button {
            font-size: 12px;
            padding: 3px 6px;
          }
        }
      `}</style>
    </button>
  );
};

const FeaturedCategoryButton = ({ label = "Discover Now", link, onClick, className, basePath = '', disabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (link) {
      navigate(basePath ? `${basePath}/${link}` : link);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `featured-category-button ${className}` : 'featured-category-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .featured-category-button {
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : '#dc3545'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : '#dc3545'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
          border-radius: var(--button-border-radius);
        }
        .featured-category-button:hover:not(:disabled) {
          color: #fff;
          background-color: var(--button-hover-color);
          border-color: var(--button-hover-color);
        }
        @media (max-width: 768px) {
          .featured-category-button {
            font-size: 13px;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .featured-category-button {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const BuyNowButton = ({ label = "Buy Now", productType, productId, link, onClick, className, basePath = '', disabled, showIcon = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick(productId);
    } else if (link) {
      navigate(basePath ? `${basePath}/${link}` : link);
    } else if (productId) {
      navigate(`/nyraa/product/${productId}`);
    } else if (productType) {
      navigate(`/nyraa/product/${productType}`);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `product-list-button ${className}` : 'product-list-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <FaShoppingBag className="buy-now-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .product-list-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : '#ff4d4f'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : '#ff4d4f'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition), transform 0.3s ease, opacity 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          position: absolute;
          bottom: 10px;
          left: 0.5rem;
          width: calc(100% - 1rem);
          opacity: 0;
          transform: translateY(100%);
        }
        .product-list-button:hover:not(:disabled) {
          color: #fff;
          background-color: #BE6992;
          border-color: #BE6992;
        }
        .buy-now-icon {
          font-size: 16px;
        }
        @media (max-width: 767px) {
          .product-list-button {
            font-size: 13px;
            padding: 6px 12px;
            position: static;
            opacity: 1;
            transform: translateY(0);
            margin-top: 0.5rem;
          }
        }
        @media (max-width: 576px) {
          .product-list-button {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const AddToCartButton = ({ label = "Add to Cart", productType, onClick, className, disabled, showIcon = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick(productType);
    } else if (productType) {
      navigate(`/nyraa/product/${productType}`);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `add-to-cart-button ${className}` : 'add-to-cart-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <IconLink iconType="cart" className="add-to-cart-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .add-to-cart-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : 'var(--button-primary-color)'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : 'var(--button-primary-color)'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
          border-radius: var(--button-border-radius);
          gap: 6px;
          flex: 1;
          height: 48px;
          min-width: 120px;
        }
        .add-to-cart-button:hover:not(:disabled) {
          background-color: var(--button-primary-color);
          color: #fff;
          border-color: var(--button-primary-color);
        }
        .add-to-cart-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .add-to-cart-button {
            font-size: 13px;
            padding: 6px 12px;
            height: 44px;
            min-width: 100px;
          }
          .add-to-cart-icon {
            font-size: 14px;
          }
        }
        @media (max-width: 576px) {
          .add-to-cart-button {
            font-size: 12px;
            padding: 5px 10px;
            height: 40px;
            min-width: 90px;
          }
          .add-to-cart-icon {
            font-size: 13px;
          }
        }
      `}</style>
    </button>
  );
};

const PurchaseNowButton = ({ label = "Buy Now", productId, onClick, className, disabled, showIcon = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick(productId);
    } else if (productId) {
      navigate(`/nyraa/product/${productId}`);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `purchase-now-button ${className}` : 'purchase-now-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <FaShoppingBag className="purchase-now-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .purchase-now-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: #fff;
          background-color: var(--button-primary-color);
          border: none;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition), transform 0.3s ease, opacity 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          position: absolute;
          bottom: 10px;
          left: 0.5rem;
          width: calc(100% - 1rem);
          opacity: 0;
          transform: translateY(100%);
        }
        .purchase-now-button:hover:not(:disabled) {
          background-color: var(--button-hover-color);
        }
        .purchase-now-icon {
          font-size: 16px;
        }
        @media (max-width: 767px) {
          .purchase-now-button {
            font-size: 13px;
            padding: 6px 12px;
            position: static;
            opacity: 1;
            transform: translateY(0);
            margin-top: 0.5rem;
          }
        }
        @media (max-width: 576px) {
          .purchase-now-button {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const PurchaseNowTwoButton = ({
  label = "Buy Now",
  productId,
  onClick,
  className,
  disabled,
  showIcon = true
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick(productId);
    } else {
      navigate('/nyraa/checkout');
    }
  };

  return (
    <button
      className={className ? `purchase-now-two-button ${className}` : 'purchase-now-two-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <FaShoppingBag className="purchase-now-two-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .purchase-now-two-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : '#ff4d4f'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : '#ff4d4f'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
          border-radius: var(--button-border-radius);
          gap: 6px;
          flex: 1;
          height: 48px;
          min-width: 120px;
        }
        .purchase-now-two-button:hover:not(:disabled) {
          background-color: #D47A9D;
          color: #fff;
          border-color: #BE6992;
        }
        .purchase-now-two-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .purchase-now-two-button {
            font-size: 13px;
            padding: 6px 12px;
            height: 44px;
            min-width: 100px;
          }
          .purchase-now-two-icon {
            font-size: 14px;
          }
        }
        @media (max-width: 576px) {
          .purchase-now-two-button {
            font-size: 12px;
            padding: 5px 10px;
            height: 40px;
            min-width: 90px;
          }
          .purchase-now-two-icon {
            font-size: 13px;
          }
        }
      `}</style>
    </button>
  );
};

const ProductListButton = ({ label = "Shop Now", productId, onClick, className, disabled, showIcon = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick(productId);
    } else if (productId) {
      navigate(`/nyraa/product/${productId}`);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `product-list-button ${className}` : 'product-list-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <IconLink iconType="buy-now" className="product-list-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .product-list-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : '#ff4d4f'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : '#ff4d4f'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition), transform 0.3s ease, opacity 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          position: absolute;
          bottom: 10px;
          left: 0.5rem;
          width: calc(100% - 1rem);
          opacity: 0;
          transform: translateY(100%);
        }
        .product-list-button:hover:not(:disabled) {
          color: #fff;
          background-color: #D47A9D;
          border-color: #BE6992;
        }
        .product-list-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 767px) {
          .product-list-button {
            font-size: 13px;
            padding: 6px 12px;
            position: static;
            opacity: 1;
            transform: translateY(0);
            margin-top: 0.5rem;
          }
        }
        @media (max-width: 576px) {
          .product-list-button {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const ViewCartButton = ({ label = "View Cart", onClick, className, disabled, showIcon = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      navigate('/nyraa/cart');
    }
  };

  return (
    <button
      className={className ? `view-cart-button ${className}` : 'view-cart-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      {showIcon && <IconLink iconType="cart" className="view-cart-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .view-cart-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          padding: 8px 16px;
          color: ${disabled ? '#6c757d' : 'var(--button-primary-color)'};
          background: none;
          border: 1px solid ${disabled ? '#6c757d' : 'var(--button-primary-color)'};
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
          border-radius: var(--button-border-radius);
          gap: 6px;
          flex: 1;
        }
        .view-cart-button:hover:not(:disabled) {
          color: #fff;
          background-color: var(--button-primary-color);
          border-color: var(--button-primary-color);
        }
        .view-cart-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .view-cart-button {
            font-size: 13px;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .view-cart-button {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const AddAddressButton = ({ label = "Add New Address", onClick, className, showIcon = true }) => {
  return (
    <button
      className={className ? `add-address-button ${className}` : 'add-address-button'}
      onClick={onClick}
    >
      {showIcon && <IconLink iconType="plus" className="add-address-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .add-address-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          padding: 8px 16px;
          color: #fff;
          background: linear-gradient(135deg, var(--button-primary-color) 0%, var(--button-hover-color) 100%);
          border: none;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition), transform 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          box-shadow: var(--button-shadow);
        }
        .add-address-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
        .add-address-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .add-address-button {
            font-size: 0.9rem;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .add-address-button {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const SetDefaultButton = ({ label = "Set Default", addressId, onClick, className, showIcon = true }) => {
  return (
    <button
      className={className ? `set-default-button ${className}` : 'set-default-button'}
      onClick={() => onClick(addressId)}
    >
      {showIcon && <IconLink iconType="check" className="set-default-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .set-default-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          padding: 6px 12px;
          color: var(--button-primary-color);
          background: none;
          border: 1px solid var(--button-primary-color);
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition), transform 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 4px;
          box-shadow: var(--button-shadow);
        }
        .set-default-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.3);
          background: linear-gradient(135deg, var(--button-primary-color) 0%, var(--button-hover-color) 100%);
          color: #fff;
          border-color: var(--button-primary-color);
        }
        .set-default-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .set-default-button {
            font-size: 0.8rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .set-default-button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
        }
      `}</style>
    </button>
  );
};

const DeleteAddressButton = ({ label = "Delete", addressId, onClick, className, showIcon = true }) => {
  return (
    <button
      className={className ? `delete-address-button ${className}` : 'delete-address-button'}
      onClick={() => onClick(addressId)}
    >
      {showIcon && <IconLink iconType="trash2" className="delete-address-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .delete-address-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          padding: 6px 12px;
          color: #D47A9D;
          background: none;
          border: 1px solid #BE6992;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition), transform 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 4px;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }
        .delete-address-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 53, 69, 0.3);
background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          color: #fff;
          border-color: #dc3545;
        }
        .delete-address-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .delete-address-button {
            font-size: 0.8rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .delete-address-button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
        }
      `}</style>
    </button>
  );
};

const ResetButton = ({ label = "Reset", onClick, className, showIcon = true }) => {
  return (
    <button
      className={className ? `reset-button ${className}` : 'reset-button'}
      onClick={onClick}
    >
      {showIcon && <IconLink iconType="x" className="reset-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .reset-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          padding: 8px 16px;
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition), transform 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
        .reset-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .reset-button {
            font-size: 0.9rem;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .reset-button {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const ViewDetailsButton = ({ label = "View Details", productId, onClick, className, showIcon = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(productId);
    } else if (productId) {
      navigate(`/nyraa/product/${productId}`);
    } else {
      navigate('/nyraa/collections/dresses');
    }
  };

  return (
    <button
      className={className ? `view-details-button ${className}` : 'view-details-button'}
      onClick={handleClick}
    >
      {showIcon && <IconLink iconType="buy-now" className="view-details-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .view-details-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          padding: 8px 15px;
          color: #fff;
          background-color: var(--button-primary-color);
          border: none;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: pointer;
          transition: var(--button-transition);
          border-radius: var(--button-border-radius);
          gap: 6px;
        }
        .view-details-button:hover {
          background-color: var(--button-hover-color);
        }
        .view-details-icon {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .view-details-button {
            font-size: 0.85rem;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .view-details-button {
            font-size: 0.8rem;
            padding: 5px 10px;
          }
        }
      `}</style>
    </button>
  );
};

const RemoveWishlistButton = ({ productId, onClick, className }) => {
  return (
    <button
      className={className ? `remove-wishlist-button ${className}` : 'remove-wishlist-button'}
      onClick={() => onClick(productId)}
      aria-label="Remove from cart"
      title="Remove from cart"
    >
      <IconLink iconType="trash2" className="remove-wishlist-icon" />
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .remove-wishlist-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          color: #fff;
          background-color:#f11f22;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--button-transition);
        }
        .remove-wishlist-button:hover {
          background-color: ##E62121;
        }
        .remove-wishlist-icon {
          display: flex;
          align-items: center;
          color: #fff;
        }
        .remove-wishlist-icon svg {
          stroke: #fff;
        }
        @media (max-width: 768px) {
          .remove-wishlist-button {
            width: 32px;
            height: 32px;
          }
        }
        @media (max-width: 576px) {
          .remove-wishlist-button {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </button>
  );
};

const QuantityButton = ({ action, onClick, className, disabled }) => {
  return (
    <button
      className={className ? `quantity-button ${className}` : 'quantity-button'}
      onClick={onClick}
      disabled={disabled}
    >
      {action === 'increment' ? '+' : '-'}
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .quantity-button {
          border: 1px solid #ddd;
          background: none;
          color: #333;
          font-size: 0.9rem;
          padding: 2px 8px;
          border-radius: 2px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
        }
        .quantity-button:hover:not(:disabled) {
          background-color: #f5f5f5;
        }
        @media (max-width: 768px) {
          .quantity-button {
            font-size: 0.8rem;
            padding: 1px 6px;
          }
        }
        @media (max-width: 576px) {
          .quantity-button {
            font-size: 0.75rem;
            padding: 0px 5px;
          }
        }
      `}</style>
    </button>
  );
};

const CheckoutButton = ({ label = "Check Out", onClick, className, disabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <button
      className={className ? `checkout-button ${className}` : 'checkout-button'}
      onClick={handleClick}
      disabled={disabled}
    >
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .checkout-button {
          font-size: 0.9rem;
          padding: 8px 20px;
          border-radius: var(--button-border-radius);
          background-color: var(--button-primary-color);
          border: none;
          color: #fff;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition);
        }
        .checkout-button:hover:not(:disabled) {
          background-color: var(--button-hover-color);
        }
        @media (max-width: 768px) {
          .checkout-button {
            font-size: 0.85rem;
            padding: 6px 15px;
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </button>
  );
};

const ConfirmOrderButton = ({ label = "Confirm Order", onClick, className, disabled, showIcon = true }) => {
  return (
    <button
      className={className ? `confirm-order-button ${className}` : 'confirm-order-button'}
      onClick={onClick}
      disabled={disabled}
    >
      {showIcon && <FaShoppingBag className="confirm-order-icon" />}
      <span>{label}</span>
      <style jsx>{`
        :root {
          --button-primary-color: #D47A9D;
          --button-hover-color: #BE6992;
          --button-font: 'Open Sans', sans-serif;
          --button-border-radius: 8px;
          --button-transition: all 0.3s ease;
          --button-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }

        .confirm-order-button {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          padding: 6px 12px;
          color: #fff;
          background: linear-gradient(135deg, var(--button-primary-color) 0%, var(--button-hover-color) 100%);
          border: none;
          text-decoration: none;
          font-family: var(--button-font);
          font-weight: 600;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: var(--button-transition), transform 0.3s ease;
          border-radius: var(--button-border-radius);
          gap: 6px;
          box-shadow: var(--button-shadow);
        }
        .confirm-order-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
        .confirm-order-icon {
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .confirm-order-button {
            font-size: 0.8rem;
            padding: 5px 10px;
          }
          .confirm-order-icon {
            font-size: 13px;
          }
        }
        @media (max-width: 576px) {
          .confirm-order-button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
          .confirm-order-icon {
            font-size: 12px;
          }
        }
      `}</style>
    </button>
  );
};

export {
  PromoNavButton,
  FeaturedCategoryButton,
  BuyNowButton,
  AddToCartButton,
  PurchaseNowButton,
  PurchaseNowTwoButton,
  ProductListButton,
  ViewCartButton,
  AddAddressButton,
  SetDefaultButton,
  DeleteAddressButton,
  ResetButton,
  ViewDetailsButton,
  RemoveWishlistButton,
  QuantityButton,
  CheckoutButton,
  ConfirmOrderButton
};