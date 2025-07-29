import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ReviewSection = () => {
  const [sortOrder, setSortOrder] = useState('Recent');
  const [displayCount, setDisplayCount] = useState(10);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCountDropdown, setShowCountDropdown] = useState(false);

  // Clothing-related review data
  const reviewData = {
    averageRating: 4.7,
    totalReviews: 24,
    distribution: [
      { stars: 5, count: 18 },
      { stars: 4, count: 4 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 }
    ],
    reviews: [
      {
        id: 1,
        name: 'Amelia Parker',
        initials: 'AP',
        rating: 5,
        date: '04/12/2025',
        highlight: '"This silk dress is absolutely gorgeous - the fit is perfect!"',
        content: 'I purchased the emerald silk dress for a wedding and received so many compliments. The material is high quality and the cut is very flattering for my body type. Will definitely shop here again.'
      },
     
    ]
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    // Here you would typically open a review form or modal
    console.log(`User clicked on ${rating} stars`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i key={index} className={`bi bi-star${index < rating ? '-fill' : ''} text-warning`}></i>
    ));
  };

  const renderRatingStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index} 
        className={`bi bi-star${index < (hoverRating || selectedRating) ? '-fill' : ''}`}
        onMouseEnter={() => handleStarHover(index + 1)}
        onMouseLeave={() => handleStarHover(0)}
        onClick={() => handleStarClick(index + 1)}
        style={{ cursor: 'pointer', fontSize: '1.2rem', marginRight: '5px' }}
      ></i>
    ));
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
    setShowCountDropdown(false);
  };

  const toggleCountDropdown = () => {
    setShowCountDropdown(!showCountDropdown);
    setShowSortDropdown(false);
  };

  const handleSortSelect = (option) => {
    setSortOrder(option);
    setShowSortDropdown(false);
  };

  const handleCountSelect = (count) => {
    setDisplayCount(count);
    setShowCountDropdown(false);
  };

  return (
    <div className="my-5 px-2 px-md-4">
      {/* Header with Title */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">Reviews</h2>
        </div>
      </div>

      {/* Main Content: Rating Summary and Filters */}
      <div className="row mb-4 mx-2">
        {/* Rating Summary */}
        <div className="col-md-4 mb-4 mb-md-0">
          <div className="rating-summary">
            <h1 className="display-4 mb-0">{reviewData.averageRating.toFixed(1)}</h1>
            <p className="text-muted mb-4">/5 ({reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'review' : 'reviews'})</p>
            <div className="rating-distribution">
              {reviewData.distribution.map((item) => (
                <div key={item.stars} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{item.stars} {item.stars === 1 ? 'star' : 'stars'}</span>
                  <div className="progress w-50">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: reviewData.totalReviews > 0 
                          ? `${(item.count / reviewData.totalReviews) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Review Cards Column */}
        <div className="col-md-8">
          {/* Filter Dropdowns */}
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative me-4">
              <div 
                className="d-flex align-items-center" 
                style={{ cursor: 'pointer' }} 
                onClick={toggleSortDropdown}
              >
                {sortOrder} <i className="bi bi-caret-down-fill ms-1"></i>
              </div>
              {showSortDropdown && (
                <div className="position-absolute bg-white shadow-sm border rounded mt-1 py-1" style={{ zIndex: 1000, minWidth: '120px' }}>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSortSelect('Recent')}
                  >
                    Recent
                  </div>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSortSelect('Highest')}
                  >
                    Highest
                  </div>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSortSelect('Lowest')}
                  >
                    Lowest
                  </div>
                </div>
              )}
            </div>
            <div className="position-relative">
              <div 
                className="d-flex align-items-center" 
                style={{ cursor: 'pointer' }} 
                onClick={toggleCountDropdown}
              >
                {displayCount} <i className="bi bi-caret-down-fill ms-1"></i>
              </div>
              {showCountDropdown && (
                <div className="position-absolute bg-white shadow-sm border rounded mt-1 py-1" style={{ zIndex: 1000, minWidth: '80px' }}>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCountSelect(10)}
                  >
                    10
                  </div>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCountSelect(50)}
                  >
                    50
                  </div>
                  <div 
                    className="px-3 py-1 cursor-pointer hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCountSelect(100)}
                  >
                    100
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Individual Reviews */}
          {reviewData.reviews.slice(0, displayCount).map(review => (
            <div key={review.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center mb-3">
                  <div 
                    className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
                  >
                    {review.initials}
                  </div>
                  <div className="ms-3">
                    <h5 className="card-title mb-0">{review.name}</h5>
                    <div className="rating mb-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="ms-auto text-muted">{review.date}</div>
                </div>
                <p className="card-text fw-bold">{review.highlight}</p>
                <p className="card-text">{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Prompt */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="review-prompt d-flex align-items-center">
            <span className="me-3">Click to review this clothing item:</span>
            <div className="rating">
              {renderRatingStars()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;