import React from 'react';
import './Footer.css';
import IconLink from '../ui/Icons';

const Footer = () => {
  return (
    <footer className="custom-footer pt-4 pb-3">
      <div className="footer-content px-2">
        <div className="row mx-0">
          {/* About Company */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="footer-title">About Our Store</h5>
            <p className="footer-text">
              We are committed to offering stylish women's clothing with quality service. Our aim is to inspire confidence and fashion in every individual.
            </p>
            <div className="social-icons mt-3">
              <IconLink to="#" iconType="facebook" isSocial />
              <IconLink to="#" iconType="instagram" isSocial />
              <IconLink to="#" iconType="twitter" isSocial />
              <IconLink to="#" iconType="youtube" isSocial />
            </div>
          </div>

          {/* Company */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="footer-title">About Company</h5>
            <ul className="list-unstyled mt-3">
              <li><a href="#">Contact</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Products */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="footer-title">Products</h5>
            <ul className="list-unstyled">
              <li><a href="#">Categories</a></li>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Top Sellers</a></li>
              <li><a href="#">Gift Cards</a></li>
            </ul>
          </div>

          {/* Your Account */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="footer-title">Your Account</h5>
            <ul className="list-unstyled">
              <li><a href="#">My Account</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Wishlist</a></li>
            </ul>
          </div>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row mt-3">
          <p className="mb-2 mb-md-0">© {new Date().getFullYear()} All rights reserved.</p>
          <p className="mb-0">Developed by <a href="https://jayamwebsolutions.com" target="_blank" rel="noopener noreferrer">Jayam Web Solutions</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;