import React from 'react';
import { Carousel } from 'react-bootstrap';
import IconLink from '../ui/Icons';
import { bannerImages } from '../../data/productsData'; 
import './Banner.css';

const Banner = () => {
  return (
    <section className="custom-banner">
      <Carousel
        controls
        indicators={false}
        interval={5000}
        pause={false}
        prevIcon={<IconLink iconType="carousel-prev" />}
        nextIcon={<IconLink iconType="carousel-next" />}
      >
        {bannerImages.map((image, index) => (
          <Carousel.Item key={index}>
            <div className="banner-image">
              <img
                src={image}
                alt={`Banner ${index + 1}`}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default Banner;