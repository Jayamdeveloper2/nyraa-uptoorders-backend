import React from 'react';

const ThisWeekHighlights = () => {
  const data = {
    imageUrl: "https://assets.ajio.com/cms/AJIO/WEB/D-UHP-1.0-NEW-USER-NEW30.jpg",
    altText: "Trendy Clothing"
  };

  return (
    <section className="py-4 mx-4">
      <div style={{ margin: '0 1rem' }}>
        <img
          src={data.imageUrl}
          alt={data.altText}
          className="img-fluid w-100 banner-image"
          style={{ 
            maxHeight: '400px',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => {
            console.warn(`⚠️ Failed to load highlight image: ${data.imageUrl}`);
            e.target.src = data.imageUrl;
          }}
        />
      </div>
    </section>
  );
};

export default ThisWeekHighlights;