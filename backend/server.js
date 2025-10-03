import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from "stripe";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4242;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    // For the webhook, we need the raw body, not JSON
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.get('/products', (req, res) => {
  const productsPath = path.join(__dirname, 'products.json');
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products file:', err);
      return res.status(500).json({ error: 'Failed to load product data.' });
    }
    res.json(JSON.parse(data));
  });
});


app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customer_email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request: No items provided.' });
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description, 
        },
        unit_amount: item.price, 
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer_email || undefined,
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/canceled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`✅ Payment successful for session: ${session.id}`);

  }


  res.json({ received: true });
});


app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));