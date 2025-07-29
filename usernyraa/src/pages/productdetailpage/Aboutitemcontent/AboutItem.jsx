import React from 'react';

const AboutItem = () => {
  return (
    <div className="about-item-wrapper" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* Tab Heading */}
      <div className="text-center border-bottom pb-2 mb-4 position-relative">
        <h5 className="d-inline-block px-3 bg-white position-relative" style={{ color: '#c98b72', fontWeight: 'bold', top: '12px' }}>
          Description
        </h5>
      </div>

      {/* About Content */}
      <div className="about-content px-1">
        <h2 className="h4 fw-bold mb-3">About this item</h2>
        <p className="text-muted mb-4">
          Embrace the essence of summer with our Breezy Linen Dress. Designed for effortless style, this airy piece keeps you cool and chic during sunny days and warm nights, making it the perfect addition to your wardrobe.
        </p>

        <div className="d-flex flex-column gap-3">
          <p className="text-muted m-0">
            <strong className="text-dark">Lightweight Comfort:</strong> Crafted from premium linen fabric for a breathable, relaxed fit. It keeps you cool in hot weather, making it the perfect summer garment.
          </p>
          <p className="text-muted m-0">
            <strong className="text-dark">Chic Design:</strong> Features a flattering A-line silhouette with delicate pleats. The design effortlessly blends elegance with a casual look for any occasion.
          </p>
          <p className="text-muted m-0">
            <strong className="text-dark">Versatile Styling:</strong> Pair it with sandals for a laid-back day or dress it up with heels for a chic evening look. Its versatility makes it an essential piece in your wardrobe.
          </p>
          <p className="text-muted m-0">
            <strong className="text-dark">Easy Care:</strong> Machine washable, maintaining its softness and shape over time. This dress is designed to keep its quality after repeated wears.
          </p>
        </div>

     
      </div>
      
      {/* Internal CSS */}
      <style>{`
        .about-item-wrapper {
          padding-top: 30px;
          padding-bottom: 30px;
          margin: 0 auto;
          width: 100%;
        }

        .about-content {
          margin: 0 30px;
        }

        @media (max-width: 768px) {
          .about-content {
            margin: 0 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutItem;
