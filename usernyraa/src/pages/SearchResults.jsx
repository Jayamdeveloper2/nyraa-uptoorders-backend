// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";
import BannerBreadcrumb from "../components/ui/BannerBreadcrumb";
import { PurchaseNowButton } from "../components/ui/Buttons";
import IconLink from "../components/ui/Icons";
import allProducts from "../data/productsData";
import "./ProductList.css"; // Reuse the same styling

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  
  const [searchResults, setSearchResults] = useState([]);
  const [sort, setSort] = useState("bestSelling");
  const [hoveredProductId, setHoveredProductId] = useState(null);
  
  // Get search query from URL
  const searchQuery = new URLSearchParams(location.search).get("q") || "";
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Filter products based on search query
    if (searchQuery) {
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Sort results
      sortResults(filtered, sort);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, sort]);
  
  const sortResults = (results, sortOption) => {
    let sortedResults = [...results];
    
    switch (sortOption) {
      case "priceLowToHigh":
        sortedResults.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        sortedResults.sort((a, b) => b.price - a.price);
        break;
      case "bestSelling":
      default:
        sortedResults.sort((a, b) => b.rating - a.rating || a.price - b.price);
        break;
    }
    
    setSearchResults(sortedResults);
  };
  
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    sortResults(searchResults, newSort);
  };
  
  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };
  
  const handleShopNow = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };
  
  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some((item) => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };
  
  const handleImageHover = (productId) => {
    setHoveredProductId(productId);
  };
  
  const handleImageLeave = () => {
    setHoveredProductId(null);
  };
  
  return (
    <div>
      <BannerBreadcrumb
        breadcrumbs={[{ label: "Home", link: "/home" }, { label: "Search Results" }]}
        title={`Search Results for "${searchQuery}"`}
        backgroundImage="https://images.unsplash.com/photo-1445205170230-053b83016050"
      />
      
      <div className="product-list">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-0">{searchResults.length} results found</h5>
            </div>
            <div className="sort-section">
              <Form.Select
                value={sort}
                onChange={handleSortChange}
                className="form-select-sm premium-select"
              >
                <option value="bestSelling">Best Selling</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
              </Form.Select>
            </div>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="products-container">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {searchResults.map((product) => (
                  <div key={product.id} className="col">
                    <div className="product-card h-100">
                      <div
                        className="product-image-container"
                        onMouseEnter={() => handleImageHover(product.id)}
                        onMouseLeave={handleImageLeave}
                      >
                        <img
                          src={
                            hoveredProductId === product.id && product.secondaryImage
                              ? product.secondaryImage
                              : product.image || "/placeholder.svg"
                          }
                          alt={product.name}
                          className="product-image"
                          onClick={() => handleProductClick(product)}
                        />
                        <div className="wishlist-wrapper">
                          <IconLink
                            iconType="wishlist"
                            className={`wishlist-icon ${wishlistItems.some((item) => item.id === product.id) ? "filled" : ""}`}
                            onClick={() => handleWishlistToggle(product)}
                          />
                        </div>
                      </div>
                      <div className="product-info">
                        <div className="product-info-content">
                          <div className="content-wrapper">
                            <div className="brand-name">{product.brand}</div>
                            <h3 className="product-name">{product.name}</h3>
                            <div className="price-container">
                              {product.discount > 0 && (
                                <span className="original-price">₹{product.originalPrice.toFixed(0)}</span>
                              )}
                              <span className="discounted-price">₹{product.price.toFixed(0)}</span>
                              {product.discount > 0 && <span className="discount">-{product.discount}%</span>}
                            </div>
                          </div>
                        </div>
                        <PurchaseNowButton
                          label="Buy Now"
                          productId={product.id}
                          onClick={() => handleShopNow(product)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <h4>No products found matching "{searchQuery}"</h4>
              <p className="text-muted">Try a different search term or browse our categories</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default SearchResults;