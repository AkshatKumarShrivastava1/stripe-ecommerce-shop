import React from 'react';
import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="container centered">
      <div className="card">
        <h2>✅ Payment Successful!</h2>
        <p>Thank you for your purchase. A confirmation email has been sent to you.</p>
        <Link to="/" className="button">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}