import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaShippingFast } from 'react-icons/fa';
import { PromoNavButton } from '../ui/Buttons';

const OfferNav = () => {
  return (
    <div className="offer-nav w-100">
      <style>
        {`
          .offer-nav {
            font-family: 'Open Sans', sans-serif;
            padding: 0.3rem 0;
          }

          .offer-nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 0 1rem;
          }

          .offer-left {
            display: flex;
            align-items: center;
          }

          .offer-right {
            display: flex;
            align-items: center;
          }

          .offer-text {
            font-size: 0.9rem;
            color: #222;
            display: flex;
            align-items: center;
            line-height: 1.2;
            flex-wrap: wrap;
          }

          .offer-link {
            color: #222 !important;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.2rem 0 !important;
            margin: 0 !important;
            transition: color 0.3s ease;
          }

          .offer-link:hover {
            color: #BE6992 !important;
          }

          .offer-link:not(:last-child)::after {
            content: '|';
            display: inline-block;
            margin: 0 4px;
            color: #222;
            font-size: 0.75rem;
          }

          .nav-icon {
            font-size: 1.1rem;
            color: #222;
            margin-right: 0.3rem;
          }

          .offer-nav .nav {
            display: flex;
            align-items: center;
          }

          @media (max-width: 991.98px) {
            .offer-nav {
              padding: 0.2rem 0;
            }

            .offer-text {
              font-size: 0.8rem;
              justify-content: center;
              text-align: center;
              flex-wrap: wrap;
            }

            .nav-icon {
              font-size: 1rem;
              margin-right: 0.2rem;
            }

            .offer-right {
              display: none;
            }

            .offer-nav-container {
              justify-content: center;
              padding: 0 0.5rem;
            }
          }
        `}
      </style>

      <div className="offer-nav-container">
        {/* Left Side */}
        <div className="offer-left">
          <span className="offer-text">
            <FaShippingFast className="nav-icon" />
            Free shipping worldwide for all orders over ₹199
            <PromoNavButton 
              link="/collections/dresses" 
              label="Shop Now"
            />
          </span>
        </div>

        {/* Right Side */}
        <div className="offer-right">
          <Nav>
            <Nav.Link href="/nyraa/account/track" className="offer-link">Track Order</Nav.Link>
            <Nav.Link href="/nyraa/account/track" className="offer-link">Help Center</Nav.Link>
          </Nav>
        </div>
      </div>  
    </div>
  );
};

export default OfferNav;