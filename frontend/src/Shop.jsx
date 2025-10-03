import React, { useEffect, useState } from "react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4242/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function addToCart(p) {
    const existing = cart.find((c) => c.id === p.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
    setAddedToCart(p.id);
    setTimeout(() => setAddedToCart(null), 1000); // Reset after 1 second
  }

  function removeFromCart(id) {
    setCart(cart.filter((c) => c.id !== id));
  }

  async function checkout() {
    if (!email) return alert("Please enter your email before checkout");

    const items = cart.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }));

    setLoading(true);
    const res = await fetch("http://localhost:4242/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, customer_email: email })
    });
    setLoading(false);

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirect to Stripe
    } else {
      alert("Failed to create checkout session");
    }
  }

  return (
    <div className="container">
      <h1>Simple Stripe Shop</h1>

      <div className="layout">
        <div className="products">
          <h2>Products</h2>
          {loading && <p>Loading products...</p>}
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="card">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price">${(p.price / 100).toFixed(2)}</p>
                <button onClick={() => addToCart(p)}>
                  {addedToCart === p.id ? "Added!" : "Add to cart"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart">
          <h2>Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
          <div className="cart-list">
            {cart.map((c) => (
              <div key={c.id} className="cart-item">
                <div>
                  <strong>{c.name}</strong> x {c.quantity}
                  <div className="price-small">
                    ${(c.price * c.quantity / 100).toFixed(2)}
                  </div>
                </div>
                <button onClick={() => removeFromCart(c.id)}>Remove</button>
              </div>
            ))}
            {cart.length === 0 && <p>Your cart is empty.</p>}
          </div>

          <hr />

          <input
            type="email"
            placeholder="Your email (required)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="checkout"
            onClick={checkout}
            disabled={cart.length === 0 || loading}
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}