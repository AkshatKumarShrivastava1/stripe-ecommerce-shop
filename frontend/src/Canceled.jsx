import React from 'react';
import { Link } from 'react-router-dom';

export default function Canceled() {
  return (
    <div className="container centered">
      <div className="card">
        <h2>❌ Payment Canceled</h2>
        <p>Your payment was not processed. Your cart has been saved, and you can try again anytime.</p>
        <Link to="/" className="button">
          Back to Shop
        </Link>
      </div>
    </div>
  );
}