import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { categoryImages } from '../../data/productsData';

const ActivewearSpotlight = () => {
  const items = [
    {
      title: categoryImages[6].subTitle,
      subtitle: categoryImages[6].title,
      imageUrl: categoryImages[6].image,
      discountPrice: categoryImages[6].discountPrice,
    },
    {
      title: categoryImages[8].subTitle,
      subtitle: categoryImages[8].title,
      imageUrl: categoryImages[8].image,
      discountPrice: categoryImages[8].discountPrice,
    },
  ];

  return (
    <section className="py-3 px-3 mx-3">
      <Row className="g-3">
        {items.map((item, index) => (
          <Col md={6} xs={12} key={index}>
            <div className="d-flex flex-column-reverse flex-md-row bg-white shadow rounded overflow-hidden">
              <div className="p-3 d-flex flex-column justify-content-center text-center" style={{ flex: '1 1 50%' }}>
                <small className="text-uppercase text-muted">{item.title}</small>
                <h3 className="fw-bold">{item.subtitle}</h3>
                {item.discountPrice && <p className="discount-price">{item.discountPrice}</p>}
              </div>
              <div
                style={{
                  flex: '1 1 50%',
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '250px',
                }}
                onError={(e) => {
                  e.currentTarget.style.backgroundImage = 'url(https://via.placeholder.com/250)';
                }}
              ></div>
            </div>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default ActivewearSpotlight;
