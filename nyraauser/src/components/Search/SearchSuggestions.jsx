import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import "./SearchSuggestions.css";
import allProducts from "../../data/productsData";

const SearchSuggestions = ({ query, onSelect, onClose }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  const categories = [...new Set(allProducts.map(product => product.category))];

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsLoading(true);
      const searchTerm = query.toLowerCase().trim();

      // Scoring function to prioritize exact or near-exact name matches
      const scoredProducts = allProducts
        .map(product => {
          const nameMatch = product.name.toLowerCase().includes(searchTerm)
            ? product.name.toLowerCase() === searchTerm ? 100 : 50
            : 0;
          const brandMatch = product.brand.toLowerCase().includes(searchTerm) ? 30 : 0;
          const categoryMatch = product.category.toLowerCase().includes(searchTerm) ? 20 : 0;
          const descriptionMatch = product.description.toLowerCase().includes(searchTerm) ? 10 : 0;

          return {
            product,
            score: nameMatch + brandMatch + categoryMatch + descriptionMatch,
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.product);

      setFilteredProducts(scoredProducts);
      setHighlightedIndex(-1);
      setIsLoading(false);
    } else {
      setFilteredProducts([]);
      setHighlightedIndex(-1);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!filteredProducts.length && !categories.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredProducts.length + categories.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredProducts.length + categories.length - 1
        );
      }

      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        if (highlightedIndex < filteredProducts.length) {
          handleProductClick(filteredProducts[highlightedIndex]);
        } else {
          const categoryIndex = highlightedIndex - filteredProducts.length;
          handleCategoryClick(categories[categoryIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredProducts, highlightedIndex, categories]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
    onSelect();
    onClose();
  };

  const handleCategoryClick = (category) => {
    navigate(`/collections/${category.toLowerCase()}`);
    onSelect();
    onClose();
  };

  if (query.trim().length === 0 && filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="search-suggestions" ref={suggestionsRef}>
      {isLoading ? (
        <div className="no-suggestions">Loading...</div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="suggestion-section">
            <div className="suggestion-heading">Products</div>
            {filteredProducts.map((product, index) => (
              <ListGroup.Item
                key={product.id}
                action
                className={`suggestion-item ${highlightedIndex === index ? 'bg-light' : ''}`}
                onClick={() => handleProductClick(product)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="suggestion-image">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} />
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{product.name}</div>
                  <div className="suggestion-price">₹{product.price.toFixed(0)}</div>
                </div>
              </ListGroup.Item>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-heading">Categories</div>
              {categories.map((category, index) => (
                <ListGroup.Item
                  key={category}
                  action
                  className={`suggestion-category ${highlightedIndex === filteredProducts.length + index ? 'bg-light' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHighlightedIndex(filteredProducts.length + index)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </ListGroup.Item>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-suggestions">
          No results found for "{query}"
        </div>
      )}
      <div className="view-all-results">
        <Link
          to={`/search?q=${encodeURIComponent(query)}`}
          onClick={() => { onSelect(); onClose(); }}
        >
          View all results
        </Link>
      </div>
    </div>
  );
};

export default SearchSuggestions;