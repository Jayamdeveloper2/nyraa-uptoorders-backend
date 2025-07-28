import React, { useEffect } from "react";
import "./PopupNotificationWrapper.css";

const PopupNotification = ({
  onClose,
  message,
  description,
  product,
  location,
  timeAgo,
  imageUrl,
  imageAlt,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pnw-notification">
      <div className="pnw-content">
        <button className="pnw-close-btn" onClick={onClose}>×</button>
        <p className="pnw-message">{message}</p>
        <img
          src={imageUrl}
          alt={imageAlt}
          className="pnw-product-image"
          onError={(e) => {
            console.warn(`⚠️ Failed to load notification image: ${imageUrl}`);
            e.target.src =
              "https://assets.ajio.com/medias/sys_master/root/20240904/Oc6w/66d8453e1d763220fac1041e/-473Wx593H-443051990-blue-MODEL.jpg";
          }}
        />
        <p className="pnw-description">{description}</p>
        <p className="pnw-product">{`${product} ${location}`}</p>
        <p className="pnw-time">{timeAgo}</p>
      </div>
    </div>
  );
};

const PopupNotificationWrapper = ({ orderItem, onClose }) => {
  if (!orderItem) return null;

  const notification = {
    message: "SOMEONE PURCHASED",
    description: "A fresh addition to your wardrobe.",
    product: orderItem.name,
    location: "(USA)", // Mock location, can be dynamic
    timeAgo: "Just Now",
    imageUrl: orderItem.image || // Assuming item has an image property
      "https://assets.ajio.com/medias/sys_master/root/20240904/Oc6w/66d8453e1d763220fac1041e/-473Wx593H-443051990-blue-MODEL.jpg",
    imageAlt: orderItem.name,
  };

  return (
    <PopupNotification
      onClose={onClose}
      message={notification.message}
      description={notification.description}
      product={notification.product}
      location={notification.location}
      timeAgo={notification.timeAgo}
      imageUrl={notification.imageUrl}
      imageAlt={notification.imageAlt}
    />
  );
};

export default PopupNotificationWrapper;