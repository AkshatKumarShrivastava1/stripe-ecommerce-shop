import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useSearchParams } from 'react-router-dom';

function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4242/products")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok. Is your backend server running?");
        return res.json();
      })
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item already exists in the cart, just increase its quantity.
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
    
      return [...prevCart, { ...product, quantity: 1 }];
    });

  
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1000);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  
  const checkout = async () => {
    // Simple validation for the email input.
    if (!email.includes('@')) {
      alert("Please enter a valid email before checkout.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4242/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, customer_email: email }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session.");
      
      const { url } = await res.json();
      if (url) {
        
        window.location.href = url;
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

 
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <div className="container">
      <h1>
        Modern Music & Audio
        <span>Your one-stop shop for quality gear</span>
      </h1>
      <div className="layout">
        <div className="products">
          <h2>Our Products</h2>
          {loading && products.length === 0 && <p>Loading products...</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="card">
                <img src={p.imageUrl} alt={p.name} className="product-image" />
                <div className="card-content">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p className="price">${(p.price / 100).toFixed(2)}</p>
                  <button
                    onClick={() => addToCart(p)}
                    className={addedToCart === p.id ? 'added' : ''}
                    disabled={addedToCart === p.id}
                  >
                    {addedToCart === p.id ? "Added!" : "Add to cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cart">
          <div className="cart-header">
            <div className="cart-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="cart-icon" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {totalItemsInCart > 0 && <span className="cart-badge">{totalItemsInCart}</span>}
            </div>
            <h2>Your Cart</h2>
          </div>
          <div className="cart-list">
            {cart.length === 0 ? <p>Your cart is empty.</p> : cart.map((c) => (
              <div key={c.id} className="cart-item">
                <div>
                  <strong>{c.name}</strong> x {c.quantity}
                  <div className="price-small">${(c.price * c.quantity / 100).toFixed(2)}</div>
                </div>
                <button onClick={() => removeFromCart(c.id)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>
          <hr />
          <input
            type="email"
            placeholder="Your email (required)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="checkout" onClick={checkout} disabled={cart.length === 0 || loading}>
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="container centered">
      <div className="card">
        <h2>✅ Payment Successful!</h2>
        <p>Thank you for your purchase. A confirmation email is on its way.</p>
        {sessionId && <p className="session-id">Order ID: {sessionId}</p>}
        <Link to="/" className="button">Continue Shopping</Link>
      </div>
    </div>
  );
}

function Canceled() {
  return (
    <div className="container centered">
      <div className="card">
        <h2>❌ Payment Canceled</h2>
        <p>Your payment was not processed. Your cart has been saved.</p>
        <Link to="/" className="button">Back to Shop</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/success" element={<Success />} />
      <Route path="/canceled" element={<Canceled />} />
    </Routes>
  );
}