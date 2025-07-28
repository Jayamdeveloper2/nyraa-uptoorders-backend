import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, Truck, Menu, X, ChevronRight, Home } from 'lucide-react';
import './AccountLayout.css';

const AccountLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Define breadcrumb paths
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const base = [{ label: 'Home', path: '/' }, { label: 'My Account', path: '/account' }];
    if (path.includes('/profile')) return [...base, { label: 'Profile', path: '/account/profile' }];
    if (path.includes('/orders')) return [...base, { label: 'Orders', path: '/account/orders' }];
    if (path.includes('/addresses')) return [...base, { label: 'Address Book', path: '/account/addresses' }];
    if (path.includes('/track')) return [...base, { label: 'Track Order', path: '/account/track' }];
    if (path.includes('/wishlist')) return [...base, { label: 'Wishlist', path: '/account/wishlist' }];
    return base;
  };

  return (
    <div className="account-layout container py-4">
      {/* Simple Breadcrumb - Always visible */}
      <div className="simple-breadcrumb mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb-list">
            {getBreadcrumbs().map((crumb, index) => (
              <li key={crumb.path} className="breadcrumb-item">
                {index < getBreadcrumbs().length - 1 ? (
                  <Link to={crumb.path} className="breadcrumb-link">
                    {index === 0 ? <Home size={16} className="breadcrumb-home-icon" /> : crumb.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
                {index < getBreadcrumbs().length - 1 && (
                  <ChevronRight size={14} className="breadcrumb-separator" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <button
        className={`sidebar-toggle d-md-none mb-3 ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="ms-2">{isSidebarOpen ? "Close Menu" : "Menu"}</span>
      </button>

      <div className="row g-4">
        {/* Sidebar */}
        <div className={`col-md-3 account-sidebar-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="account-sidebar">
            <div className="sidebar-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold">My Account</h5>
              <button 
                className="sidebar-close-btn d-md-none" 
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="sidebar-menu">
              <NavLink
                to="/account/profile"
                className="sidebar-menu-item d-flex align-items-center"
                end
                onClick={closeSidebar}
              >
                <User size={18} className="me-3" />
                <span>Profile</span>
              </NavLink>
              <NavLink
                to="/account/orders"
                className="sidebar-menu-item d-flex align-items-center"
                onClick={closeSidebar}
              >
                <Package size={18} className="me-3" />
                <span>Orders</span>
              </NavLink>
              <NavLink
                to="/account/addresses"
                className="sidebar-menu-item d-flex align-items-center"
                onClick={closeSidebar}
              >
                <MapPin size={18} className="me-3" />
                <span>Address Book</span>
              </NavLink>
              <NavLink
                to="/account/track"
                className="sidebar-menu-item d-flex align-items-center"
                onClick={closeSidebar}
              >
                <Truck size={18} className="me-3" />
                <span>Track Order</span>
              </NavLink>
              <NavLink
                to="/account/wishlist"
                className="sidebar-menu-item d-flex align-items-center"
                onClick={closeSidebar}
              >
                <Heart size={18} className="me-3" />
                <span>Wishlist</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="account-content">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <style jsx>{`
        /* Simple Breadcrumb Styles */
        .simple-breadcrumb {
          margin-bottom: 1.5rem;
        }
        
        .breadcrumb-list {
          display: flex;
          flex-wrap: wrap;
          padding: 0;
          margin: 0;
          list-style: none;
          align-items: center;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .breadcrumb-link {
          color: #D47A9D;
          text-decoration: none;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }
        
        .breadcrumb-link:hover {
          color: #BE6992;
        }
        
        .breadcrumb-current {
          color: #333;
          font-weight: 600;
        }
        
        .breadcrumb-separator {
          margin: 0 0.5rem;
          color: #adb5bd;
        }
        
        .breadcrumb-home-icon {
          margin-right: 0.25rem;
        }
        
        /* Sidebar Toggle Button */
        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #BE6992 0%, #D47A9D 100%);
          border: none;
          color: #fff;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          width: auto;
          margin-left: 0;
        }
        
        .sidebar-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(197, 164, 126, 0.4);
        }
        
        .sidebar-toggle.active {
          background: #D47A9D;
        }
        
        /* Sidebar Styles */
        .account-sidebar {
          transition: all 0.3s ease;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-header {
          padding: 1.5rem 1.5rem 0.75rem;
          background: linear-gradient(135deg, #BE6992 0%, #D47A9D 100%);
          color: #fff;
          border-radius: 12px 12px 0 0;
        }
        
        .sidebar-menu {
          padding: 1rem 0;
        }
        
        .sidebar-menu-item {
          display: block;
          padding: 1rem 1.5rem;
          color: #4b5563;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .sidebar-menu-item:hover {
          background: rgba(197, 164, 126, 0.1);
          color: #BE6992;
          transform: translateX(5px);
        }
        
        .sidebar-menu-item.active {
          background: rgba(197, 164, 126, 0.15);
          color: #BE6992;
          font-weight: 600;
          border-left: 4px solid #BE6992;
        }
        
        /* Sidebar Close Button */
        .sidebar-close-btn {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }
        
        .sidebar-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Mobile Sidebar and Overlay Styles */
        @media (max-width: 767px) {
          .simple-breadcrumb {
            margin-bottom: 1rem;
          }
          
          .breadcrumb-item {
            font-size: 0.8rem;
          }
          
          .breadcrumb-separator {
            margin: 0 0.3rem;
          }
          
          .account-sidebar-wrapper {
            position: fixed;
            top: 0;
            left: -85%;
            width: 85%;
            height: 100%;
            z-index: 1050;
            transition: left 0.3s ease;
            padding: 0;
          }
          
          .account-sidebar-wrapper.sidebar-open {
            left: 0;
          }
          
          .account-sidebar {
            height: 100%;
            overflow-y: auto;
            border-radius: 0;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          }
          
          .sidebar-header {
            border-radius: 0;
          }
          
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1040;
          }
        }
        
        @media (min-width: 768px) {
          .account-sidebar-wrapper {
            position: static;
          }
        }
        
        @media (max-width: 576px) {
          .sidebar-toggle {
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
          
          .sidebar-menu-item {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountLayout;