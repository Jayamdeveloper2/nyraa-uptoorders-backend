import React, { useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FeaturedCategoryButton } from '../ui/Buttons';
import { categoryImages } from '../../data/productsData';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
  const leftCardRef = useRef(null);
  const rightContainerRef = useRef(null);

  const categories = [
    {
      largeImage: categoryImages[0].image,
      subTitle: categoryImages[0].subTitle,
      title: categoryImages[0].title,
      link: categoryImages[0].link,
      discountPrice: categoryImages[0].discountPrice
    },
    {
      mediumImage1: categoryImages[1].image,
      subTitle: categoryImages[1].subTitle,
      title: categoryImages[1].title,
      link: categoryImages[1].link,
      discountPrice: categoryImages[1].discountPrice
    },
    {
      mediumImage2: categoryImages[2].image,
      subTitle: categoryImages[2].subTitle,
      title: categoryImages[2].title,
      link: categoryImages[2].link,
      discountPrice: categoryImages[2].discountPrice
    }
  ];

  useEffect(() => {
    const handleMargin = () => {
      const leftCard = leftCardRef.current;
      const rightContainer = rightContainerRef.current;

      if (!leftCard || !rightContainer) return;

      if (window.innerWidth < 768) {
        leftCard.style.marginTop = '0px';
        leftCard.style.height = 'auto';
        rightContainer.style.height = 'auto';
        return;
      }

      const leftHeight = leftCard.offsetHeight;
      const rightHeight = rightContainer.offsetHeight;
      const maxHeight = Math.max(leftHeight, rightHeight);

      leftCard.style.height = `${maxHeight}px`;
      rightContainer.style.height = `${maxHeight}px`;

      const offset = (rightHeight - leftHeight) / 2;
      leftCard.style.marginTop = `${offset > 0 ? offset : 0}px`;
    };

    handleMargin();
    window.addEventListener('resize', handleMargin);

    return () => window.removeEventListener('resize', handleMargin);
  }, []);

  return (
    <section className="featured-section">
      <div className="featured-wrapper">
        <h2 className="featured-heading text-center mb-5">Featured Clothing Collections</h2>
        <Row className="g-4">
          <Col md={6} xs={12} ref={leftCardRef}>
            <div className="featured-card shadow rounded overflow-hidden mt-4">
              <div
                className="image-hover"
                style={{
                  backgroundImage: categories[0].largeImage ? `url(${categories[0].largeImage})` : 'url(https://via.placeholder.com/740)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '450px',
                }}
              ></div>
              <div className="p-4 text-center">
                <small className="text-uppercase text-muted sub-title">{categories[0].subTitle}</small>
                <h3 className="fw-bold title">{categories[0].title}</h3>
                {categories[0].discountPrice && <p className="discount-price">{categories[0].discountPrice}</p>}
                <div className="mt-3">
                  <FeaturedCategoryButton
                    link={categories[0].link}
                    basePath="/collections"
                    label="Discover Now"
                  />
                </div>
              </div>
            </div>
          </Col>

          <Col md={6} xs={12} ref={rightContainerRef}>
            <Row className="g-4">
              <Col md={12} xs={12}>
                <div className="d-flex flex-column-reverse flex-md-row bg-white shadow rounded overflow-hidden featured-card">
                  <div className="p-4 d-flex flex-column justify-content-center text-center" style={{ flex: '1 1 50%' }}>
                    <small className="text-uppercase text-muted sub-title">{categories[1].subTitle}</small>
                    <h3 className="fw-bold title">{categories[1].title}</h3>
                    {categories[1].discountPrice && <p className="discount-price">{categories[1].discountPrice}</p>}
                    <div className="mt-3">
                      <FeaturedCategoryButton
                        link={categories[1].link}
                        basePath="/collections"
                        label="Discover Now"
                      />
                    </div>
                  </div>
                  <div
                    className="image-hover"
                    style={{
                      flex: '1 1 50%',
                      backgroundImage: categories[1].mediumImage1 ? `url(${categories[1].mediumImage1})` : 'url(https://via.placeholder.com/740)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '300px',
                    }}
                  ></div>
                </div>
              </Col>

              <Col md={12} xs={12}>
                <div className="d-flex flex-column flex-md-row bg-white shadow rounded overflow-hidden featured-card mt-3">
                  <div
                    className="image-hover"
                    style={{
                      flex: '1 1 50%',
                      backgroundImage: categories[2].mediumImage2 ? `url(${categories[2].mediumImage2})` : 'url(https://via.placeholder.com/740)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '300px',
                    }}
                  ></div>
                  <div className="p-4 d-flex flex-column justify-content-center text-center" style={{ flex: '1 1 50%' }}>
                    <small className="text-uppercase text-muted sub-title">{categories[2].subTitle}</small>
                    <h3 className="fw-bold title">{categories[2].title}</h3>
                    {categories[2].discountPrice && <p className="discount-price">{categories[2].discountPrice}</p>}
                    <div className="mt-3">
                      <FeaturedCategoryButton
                        link={categories[2].link}
                        basePath="/collections"
                        label="Discover Now"
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default FeaturedCategories;