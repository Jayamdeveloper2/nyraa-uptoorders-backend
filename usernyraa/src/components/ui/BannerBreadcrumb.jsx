import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled components
const BannerContainer = styled.div`
  background: ${({ backgroundImage }) => `url('${backgroundImage}') center/cover no-repeat`};
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const BannerOverlay = styled.div`
  background: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
`;

const BreadcrumbText = styled.div`
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const BreadcrumbLink = styled(Link)`
  color: #fff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbCurrent = styled.span`
  color: #ccc;
`;

const BannerTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  text-transform: uppercase;
`;

// Component
const BannerBreadcrumb = ({ breadcrumbs = [], title, backgroundImage }) => {
  return (
    <BannerContainer backgroundImage={backgroundImage}>
      <BannerOverlay>
        <BreadcrumbText>
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.link ? (
                <BreadcrumbLink to={item.link}>
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbCurrent>{item.label}</BreadcrumbCurrent>
              )}
              {index < breadcrumbs.length - 1 && " / "}
            </span>
          ))}
        </BreadcrumbText>
        <BannerTitle>{title}</BannerTitle>
      </BannerOverlay>
    </BannerContainer>
  );
};

export default BannerBreadcrumb;
