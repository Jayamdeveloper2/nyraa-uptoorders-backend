import React from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';

const Newsletter = () => {
  const newsletterData = {
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRHTWCkfrmj8g8TMKONLNGdN38sF6GaYmocw&s",
    altText: "Newsletter"
  };

  const styles = {
    section: {
      backgroundColor: '#f5f0ed',
      padding: '30px 20px',
      marginTop: '30px',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1c1c1c',
      marginBottom: '15px',
    },
    desc: {
      fontSize: '1rem',
      color: '#666',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
    },
    input: {
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: 0,
      fontSize: '14px',
      minWidth: '200px',
    },
    button: {
      backgroundColor: '#c18c73',
      color: '#fff',
      padding: '12px 25px',
      fontWeight: 600,
      border: 'none',
      borderRadius: 0,
      whiteSpace: 'nowrap',
    },
    image: {
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'cover',
      marginBottom: '30px',
    },
    textSection: {
      marginBottom: '30px',
    },
  };

  return (
    <section style={styles.section}>
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} className="text-center order-1 order-md-2 mb-4 mb-md-0">
            <Image
              src={newsletterData.imageUrl}
              alt={newsletterData.altText}
              style={styles.image}
              fluid
              onError={(e) => {
                console.warn(`⚠️ Failed to load newsletter image: ${newsletterData.imageUrl}`);
                e.target.src = newsletterData.imageUrl;
              }}
            />
          </Col>
          <Col xs={12} md={6} className="order-2 order-md-1">
            <h2 style={styles.title}>Subscribe To Our Newsletter</h2>
            <p style={styles.desc}>
              Subscribe to our latest newsletter to get news about special discounts and upcoming sales
            </p>
            <Form style={styles.form}>
              <Form.Control type="email" placeholder="Email" style={styles.input} />
              <Button style={styles.button}>SUBSCRIBE</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Newsletter;