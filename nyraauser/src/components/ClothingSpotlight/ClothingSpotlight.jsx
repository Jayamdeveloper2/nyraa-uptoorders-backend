import React from 'react';
import { bannerImages } from '../../data/productsData';

const ClothingSpotlight = () => {
  const data = {
    imageUrl: bannerImages[2], // Trendy Clothing image
    altText: 'Trendy Clothing',
  };

  return (
    <section className="py-4 mx-3">
      <div style={{ margin: '0 1rem' }}>
        <img
          src={data.imageUrl}
          alt={data.altText}
          className="img-fluid w-100 banner-image"
          style={{
            maxHeight: '400px',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1400';
          }}
        />
      </div>
    </section>
  );
};

export default ClothingSpotlight;