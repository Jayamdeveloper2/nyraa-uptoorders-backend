import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TrackOrderButton } from '../../components/ui/Myaccountbuttons/MyAccountButtons';

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      toast.error('Please enter a tracking number', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Mock API call - replace with actual API call
    setTimeout(() => {
      if (trackingNumber.startsWith('NYR')) {
        setOrder({
          id: trackingNumber,
          status: 'Shipped',
          estimatedDelivery: '2023-06-10',
          carrier: 'FedEx',
          trackingUrl: '#',
          history: [
            { date: '2023-05-30', status: 'Order Placed', details: 'Your order has been received' },
            { date: '2023-06-01', status: 'Processing', details: 'Your order is being prepared for shipment' },
            { date: '2023-06-03', status: 'Shipped', details: 'Your order has been shipped' }
          ]
        });
        setError('');
        toast.success('Order tracked successfully', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError('Invalid tracking number. Please try again.');
        setOrder(null);
        toast.error('Invalid tracking number', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }, 1000);
  };

  return (
    <div className="track-order-container">
      <h2 className="mb-4">Track Order</h2>
      
      <div className="card mb-4 border-0 shadow-lg rounded-4">
        <div className="card-body">
          <form onSubmit={handleTrack} className="row g-3 align-items-end">
            <div className="col-md-8">
              <label htmlFor="trackingNumber" className="form-label fw-medium">
                Enter your tracking number
              </label>
              <input
                type="text"
                className="form-control rounded-3"
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. NYR123456"
              />
            </div>
            <div className="col-md-4">
              <TrackOrderButton
                onClick={handleTrack}
                className="w-100"
              />
            </div>
          </form>
          {error && <div className="text-danger mt-2">{error}</div>}
        </div>
      </div>

      {order && (
        <div>
          <div className="card mb-4 border-0 shadow-lg rounded-4">
            <div className="card-body">
              <h5 className="card-title fw-semibold">Order #{order.id}</h5>
              <div className="d-flex justify-content-between flex-wrap gap-3">
                <div>
                  <p className="mb-1">
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p className="mb-1">
                    <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
                  </p>
                  <p className="mb-1">
                    <strong>Carrier:</strong> {order.carrier}
                  </p>
                </div>
                <div>
                  <a
                    href={order.trackingUrl}
                    className="btn btn-outline-dark rounded-3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Carrier Site
                  </a>
                </div>
              </div>
            </div>
          </div>

          <h5 className="mb-3 fw-semibold">Tracking History</h5>
          <div className="timeline">
            {order.history.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="d-flex justify-content-between">
                    <h6 className="mb-1 fw-medium">{event.status}</h6>
                    <small className="text-muted">{event.date}</small>
                  </div>
                  <p className="mb-0">{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        .track-order-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .form-control {
          font-size: 0.95rem;
          border-radius: 8px;
          border: 1px solid #ced4da;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .form-control:focus {
          border-color: #C5A47E;
          box-shadow: 0 0 8px rgba(197, 164, 126, 0.3);
          outline: none;
        }
        .form-label {
          font-size: 0.85rem;
          color: #333;
          font-weight: 500;
        }
        .btn {
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 8px;
        }
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #222;
        }
        h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-marker {
          position: absolute;
          left: -25px;
          top: 5px;
          width: 12px;
          height: 12px;
          background: #C5A47E;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        }
        .timeline-content {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
        }
        @media (max-width: 768px) {
          .track-order-container {
            padding: 1rem 0.75rem;
          }
          .form-control {
            font-size: 0.9rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 6px 12px;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
        }
        @media (max-width: 576px) {
          .track-order-container {
            padding: 0.75rem 0.5rem;
          }
          .form-control {
            font-size: 0.85rem;
          }
          .btn {
            font-size: 0.8rem;
            padding: 5px 10px;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          .row.g-3 {
            flex-direction: column;
            align-items: stretch;
          }
          .col-md-8, .col-md-4 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;