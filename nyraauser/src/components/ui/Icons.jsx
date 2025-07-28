import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Home, MapPin, Plus, X, Check, Briefcase, Trash2, Edit, Heart } from 'react-feather';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaBars, FaChevronDown, FaHeart } from 'react-icons/fa';

const IconLink = ({
  to,
  iconType,
  label,
  badgeCount,
  onClick,
  isBottomNav,
  isSocial,
  isSupport,
  isArrow,
  className = '',
}) => {
  const location = useLocation();

  const getActiveClass = (path) => {
    const currentPath = location.pathname.replace(/^\/nyraa/, '');
    return currentPath === path || (path === '/home' && currentPath === '')
      ? 'active'
      : '';
  };

  const renderIcon = () => {
    const navIconProps = isBottomNav
      ? { className: 'bottom-nav-icon' }
      : { size: 20, className: 'icon-outlined', strokeWidth: 1.5 };
    const socialIconProps = { className: 'social-icon' };
    const supportIconProps = { className: 'support-icon-outlined', style: { width: '24px', height: '24px' } };
    const bannerIconProps = { className: 'carousel-icon' };
    const arrowIconProps = { className: 'arrow-icon', style: { width: '24px', height: '24px' } };
    const faIconProps = isBottomNav || isSocial || isSupport ? {} : { size: 22 };

    switch (iconType) {
      case 'search':
        return <Search {...navIconProps} />;
      case 'user':
        return <User {...navIconProps} />;
      case 'wishlist':
        return (
          <FaHeart
            {...faIconProps}
            className={`wishlist-icon ${className} ${className?.includes('filled') ? 'filled' : ''}`}
            style={{
              fill: className?.includes('filled') ? '#CA7298' : 'none',
              stroke: className?.includes('filled') ? '#CA7298' : '#ccc',
              strokeWidth: className?.includes('filled') ? 0 : 2,
            }}
          />
        );
      case 'navbar-heart':
        return (
          <Heart
            {...navIconProps}
          />
        );
      case 'cart':
        return <ShoppingCart {...navIconProps} />;
      case 'home':
        return <Home {...navIconProps} />;
      case 'map-pin':
        return <MapPin {...navIconProps} />;
      case 'plus':
        return <Plus {...navIconProps} />;
      case 'x':
        return <X {...navIconProps} />;
      case 'check':
        return <Check {...navIconProps} />;
      case 'briefcase':
        return <Briefcase {...navIconProps} />;
      case 'trash2':
        return <Trash2 {...navIconProps} />;
      case 'edit':
        return <Edit {...navIconProps} />;
      case 'facebook':
        return <FaFacebookF {...socialIconProps} />;
      case 'instagram':
        return <FaInstagram {...socialIconProps} />;
      case 'twitter':
        return <FaTwitter {...socialIconProps} />;
      case 'youtube':
        return <FaYoutube {...socialIconProps} />;
      case 'bars':
        return <FaBars {...faIconProps} />;
      case 'chevron-down':
        return <FaChevronDown {...faIconProps} />;
      case 'carousel-prev':
        return (
          <span {...bannerIconProps}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </span>
        );
      case 'carousel-next':
        return (
          <span {...bannerIconProps}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </span>
        );
      case 'shipping':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M1 3h4l2.5 10h10l2.5-7h-13" />
            <circle cx="8" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M10 18h6" />
          </svg>
        );
      case 'guarantee':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path d="M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
            <path d="M8 7l2 2" />
            <path d="M16 17l-2-2" />
            <path d="M16 7l-2 2" />
            <path d="M8 17l2-2" />
          </svg>
        );
      case 'discount':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
          </svg>
        );
      case 'support':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        );
      case 'left-arrow':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        );
      case 'right-arrow':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        );
      case 'buy-now':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...supportIconProps}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M12 10v6" />
            <path d="M9 13h6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const baseClass = isSocial
    ? 'social-icon-link'
    : isBottomNav
    ? 'bottom-nav-link text-center'
    : isSupport
    ? 'support-icon'
    : isArrow
    ? 'arrow-icon-wrapper'
    : 'nav-icon text-center';
  const combinedClass = `${baseClass} ${
    !isSocial && !isBottomNav && !isSupport && !isArrow ? getActiveClass(to) : ''
  } ${isBottomNav ? 'd-flex flex-column align-items-center' : isSupport || isArrow ? '' : 'mx-2 position-relative'} ${
    className
  }`.trim();

  if (isSupport || isArrow) {
    return (
      <div className={combinedClass}>
        {renderIcon()}
      </div>
    );
  }

  if (isSocial) {
    return (
      <a href={to || '#'} className={combinedClass} onClick={onClick}>
        {renderIcon()}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      className={combinedClass}
      onClick={onClick}
      style={isBottomNav ? { maxWidth: '80px', textDecoration: 'none', color: '#6c757d' } : {}}
    >
      {renderIcon()}
      {badgeCount !== undefined && (
        <span className={isBottomNav ? 'cart-badge' : 'custom-badge'}>
          {badgeCount}
        </span>
      )}
      {isBottomNav && <span>{label}</span>}
    </NavLink>
  );
};

export default IconLink;