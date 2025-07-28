// src/components/BottomNavbar/BottomNavbar.jsx
import React, { useState } from "react";
import { Navbar, Modal, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import IconLink from '../ui/Icons';
import SearchSuggestions from "../Search/SearchSuggestions";

const BottomNavbar = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const navigate = useNavigate();

  const handleSearchModalClose = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };
  
  const handleSearchModalShow = () => setShowSearchModal(true);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      handleSearchModalClose();
    }
  };

  const handleSuggestionSelect = () => {
    setShowSuggestions(false);
    setSearchQuery("");
    handleSearchModalClose();
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <>
      <style>
        {`
          .bottom-navbar {
            font-family: 'Open Sans', sans-serif;
            padding: 0.5rem 0;
            background-color: #fff;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .bottom-nav-link {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            font-size: 0.65rem;
            font-weight: 500;
            padding: 0.2rem;
            max-width: 80px;
            color: #6c757d;
            position: relative;
          }

          .bottom-nav-icon {
            font-size: 1.4rem;
            margin-bottom: 0.2rem;
          }

          .cart-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #dc3545;
            color: white;
            font-size: 0.6rem;
            font-weight: 700;
            border-radius: 50%;
            padding: 0.15rem 0.35rem;
            line-height: 1;
            min-width: 18px;
            text-align: center;
            z-index: 1;
          }

          @media (max-width: 767px) {
            .cart-badge {
              top: -4px;
              right: -6px;
              font-size: 0.55rem;
              min-width: 16px;
              padding: 0.1rem 0.3rem;
            }
          }

          @media (min-width: 768px) and (max-width: 991px) {
            .cart-badge {
                top:3px;
              right: 20px;
              font-size: 0.58rem;
              min-width: 17px;
              padding: 0.12rem 0.32rem;
            }
          }

          @media (max-width: 425px) {
            .cart-badge {
              top:3px;
              right: 20px;
              font-size: 0.55rem;
            }
          }

          @media (max-width: 320px) {
            .cart-badge {
              top:3px;
              right: 20px;
              font-size: 0.5rem;
            }
          }
          
          /* Premium Mobile Search Modal */
          .search-modal .modal-content {
            border-radius: 12px;
            overflow: hidden;
            border: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          }
          
          .search-modal .modal-header {
            border-bottom: none;
            padding: 1rem 1.5rem;
            background-color: #fff;
          }
          
          .search-modal .modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
          }
          
          .search-modal .modal-body {
            padding: 0 1.5rem 1.5rem;
          }
          
          .search-modal .form-control {
            border: none;
            border-bottom: 2px solid #e0e0e0;
            border-radius: 0;
            padding: 0.75rem 0;
            font-size: 1.1rem;
            box-shadow: none;
            transition: border-color 0.3s ease;
          }
          
          .search-modal .form-control:focus {
            border-color: #c5a47e;
            box-shadow: none;
          }
          
          .search-modal .btn-primary {
            background-color: #c5a47e;
            border-color: #c5a47e;
            border-radius: 50px;
            padding: 0.6rem 1.5rem;
            font-weight: 500;
            margin-top: 1.5rem;
            transition: all 0.3s ease;
          }
          
          .search-modal .btn-primary:hover {
            background-color: #b69268;
            border-color: #b69268;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(197, 164, 126, 0.3);
          }
          
          .search-modal .btn-close {
            color: #777;
            opacity: 1;
            transition: color 0.2s ease;
          }
          
          .search-modal .btn-close:hover {
            color: #333;
          }
          
          /* Trending searches in modal */
          .modal-trending {
            margin-top: 1.5rem;
          }
          
          .modal-trending-title {
            font-size: 0.85rem;
            color: #777;
            margin-bottom: 0.75rem;
            font-weight: 500;
          }
          
          .modal-trending-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .modal-trending-tag {
            background-color: #f5f5f5;
            color: #555;
            padding: 0.35rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .modal-trending-tag:hover {
            background-color: #e9e9e9;
            color: #c5a47e;
          }
        `}
      </style>

      <div className="navbar-container">
        <Navbar className="bottom-navbar fixed-bottom d-lg-none">
          <div className="d-flex justify-content-around w-100">
            <IconLink to="/home" iconType="home" label="Home" isBottomNav />
            <IconLink to="/login" iconType="user" label="Profile" isBottomNav />
            <IconLink
              iconType="search"
              label="Search"
              isBottomNav
              onClick={handleSearchModalShow}
            />
            <IconLink to="/cart" iconType="cart" label="Cart" badgeCount={cartCount} isBottomNav />
          </div>
        </Navbar>
      </div>

      <Modal 
        show={showSearchModal} 
        onHide={handleSearchModalClose}
        className="search-modal"
        centered
        fullscreen="sm-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>Search Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSearchSubmit} className="position-relative">
            <div className="d-flex align-items-center">
              <IconLink iconType="search" className="me-2" style={{ color: '#c5a47e' }} />
              <Form.Control
                type="search"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
              {searchQuery && (
                <Button 
                  variant="link" 
                  className="p-0 ms-2" 
                  onClick={() => setSearchQuery("")}
                  style={{ color: '#777' }}
                >
                  <IconLink iconType="x" />
                </Button>
              )}
            </div>
            
            {showSuggestions && searchQuery.trim() ? (
              <SearchSuggestions 
                query={searchQuery} 
                onSelect={handleSuggestionSelect}
                onClose={closeSuggestions}
              />
            ) : searchQuery.trim() ? (
              <Button type="submit" className="w-100 mt-3">Search</Button>
            ) : (
              <div className="modal-trending">
                <div className="modal-trending-title">Popular Searches</div>
                <div className="modal-trending-tags">
                  <div className="modal-trending-tag" onClick={() => {
                    setSearchQuery("summer dress");
                    setShowSuggestions(true);
                  }}>Summer Dress</div>
                  <div className="modal-trending-tag" onClick={() => {
                    setSearchQuery("cotton tops");
                    setShowSuggestions(true);
                  }}>Cotton Tops</div>
                  <div className="modal-trending-tag" onClick={() => {
                    setSearchQuery("denim");
                    setShowSuggestions(true);
                  }}>Denim</div>
                  <div className="modal-trending-tag" onClick={() => {
                    setSearchQuery("floral");
                    setShowSuggestions(true);
                  }}>Floral</div>
                  <div className="modal-trending-tag" onClick={() => {
                    setSearchQuery("casual");
                    setShowSuggestions(true);
                  }}>Casual</div>
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BottomNavbar;