// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// const Invoices = () => {
//   const [invoices, setInvoices] = useState([]);

//   useEffect(() => {
//     // Fetch orders from localStorage
//     const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    
//     // Transform orders into invoices format
//     const derivedInvoices = storedOrders.map((order) => ({
//       id: `INV-${order.id}`, // Prefix to distinguish invoice ID
//       date: new Date(order.orderDate).toISOString().split('T')[0], // Format date as YYYY-MM-DD
//       orderId: order.id,
//       amount: order.total,
//       status: order.status === 'Delivered' ? 'Paid' : order.status === 'Cancelled' ? 'Refunded' : order.status
//     }));
    
//     setInvoices(derivedInvoices);
//   }, []);

//   return (
//     <div>
//       <h2 className="mb-4">Invoices</h2>
//       {invoices.length === 0 ? (
//         <div className="text-center py-5">
//           <h5>No invoices found</h5>
//           <p>Your invoices will appear here after you place orders</p>
//           <Link to="/collections/dresses" className="btn btn-outline-dark mt-3">
//             Start Shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="table-responsive">
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Invoice #</th>
//                 <th>Date</th>
//                 <th>Order #</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((invoice) => (
//                 <tr key={invoice.id}>
//                   <td>{invoice.id}</td>
//                   <td>{invoice.date}</td>
//                   <td>
//                     <Link to={`/account/orders/${invoice.orderId}`}>{invoice.orderId}</Link>
//                   </td>
//                   <td>₹{invoice.amount.toFixed(2)}</td>
//                   <td>
//                     <span className={`badge ${
//                       invoice.status === 'Paid' ? 'bg-success' : 
//                       invoice.status === 'Refunded' ? 'bg-secondary' : 'bg-warning'
//                     }`}>
//                       {invoice.status}
//                     </span>
//                   </td>
//                   <td>
//                     <Link to={`/account/invoices/${invoice.orderId}`} className="btn btn-sm btn-outline-dark">
//                       View
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//       <style jsx>{`
//         .table {
//           font-family: 'Open Sans', sans-serif;
//         }
//         .badge {
//           font-size: 0.8rem;
//         }
//         .btn {
//           font-size: 0.85rem;
//           padding: 4px 10px;
//         }
//         h2 {
//           font-size: 1.5rem;
//           font-weight: bold;
//           color: #222;
//         }
//         h5 {
//           font-size: 1.1rem;
//           font-weight: bold;
//           color: #222;
//         }
//         @media (max-width: 768px) {
//           .btn {
//             font-size: 0.8rem;
//             padding: 3px 8px;
//           }
//           h2 {
//             font-size: 1.3rem;
//           }
//           h5 {
//             font-size: 1rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Invoices;