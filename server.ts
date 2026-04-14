import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TLXzIEgWCgUtDAp6YMy62ehMooDlgQ656Hl8iR5sZteiRoz0sHyXw0k2nLVsUgVKygN2hWNMRXvQHbpeYJDij5M00CRyathLe');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin with error handling
  let dbAdmin: admin.firestore.Firestore | null = null;
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
    if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        }),
        projectId: firebaseConfig.projectId,
      });
      dbAdmin = admin.firestore();
      console.log("Firebase Admin initialized successfully");
    } else {
      console.log("Firebase Admin skipped - using mock data mode");
    }
  } catch (error: any) {
    console.error("Firebase Admin Initialization Error:", error.message);
    console.log("Continuing without Firebase Admin (mock data mode)");
  }

  // Stripe Webhook handler (needs raw body)
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed' && dbAdmin) {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId) {
        try {
          await dbAdmin.collection('subscriptions').doc(userId).set({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            plan_id: session.metadata?.planId || 'growth',
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`Subscription updated for user: ${userId}`);
        } catch (e: any) {
          console.error("Error updating subscription in Firestore:", e.message);
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Stripe Checkout Session API
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { userId, planId } = req.body;

      // Map plan IDs to prices (in cents)
      const planPrices: Record<string, number> = {
        'Starter': 2900,  // $29
        'Growth': 7900,   // $79
        'Enterprise': 19900 // $199
      };

      const unitAmount = planPrices[planId] || 7900;
      const planName = planId || 'Growth';

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        currency: 'usd', // Force USD currency
        metadata: {
          userId: userId || 'anonymous',
          planId: planName,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `TaxFlow US - ${planName} Plan`,
                description: planId === 'Starter' ? 'Up to 500 transactions/mo & Basic Nexus monitoring' : 'Unlimited transactions & Advanced Nexus Sentinel',
              },
              unit_amount: unitAmount,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        automatic_tax: { enabled: false },
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Shopify Sync API - Real Shopify data only (no mock data)
  app.post("/api/shopify-sync", async (req, res) => {
    if (!dbAdmin) {
      return res.status(503).json({
        error: "Firebase Admin not configured. Please add FIREBASE_PRIVATE_KEY to .env file.",
        message: "Please use the client-side sync feature directly from the browser."
      });
    }
    try {
      const { userId, shopUrl, accessToken } = req.body;
      if (!userId || !shopUrl || !accessToken) {
        return res.status(400).json({ error: "User ID, Shop URL, and Access Token are required" });
      }

      // Fetch real orders from Shopify
      const response = await fetch(`${shopUrl.replace(/\/$/, '')}/admin/api/2024-01/orders.json?status=any&limit=250`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const orders = data.orders;

      const orgId = userId;
      const batch = dbAdmin.batch();

      // Save real Shopify orders to Firestore
      orders.forEach((order: any) => {
        const txRef = dbAdmin.collection(`organizations/${orgId}/transactions`).doc(`shopify_${order.id}`);
        batch.set(txRef, {
          org_id: orgId,
          amount: parseFloat(order.total_price),
          transaction_date: new Date(order.created_at),
          state_code: order.shipping_address?.province_code || order.shipping_address?.state_code || 'N/A',
          platform: 'Shopify',
          description: `Order #${order.order_number} - ${order.customer?.first_name} ${order.customer?.last_name}`,
          sourceId: order.id,
          categoryId: 'sales'
        }, { merge: true });
      });

      // Update connection status
      const connRef = dbAdmin.collection(`organizations/${orgId}/connections`).doc('shopify');
      batch.set(connRef, {
        org_id: orgId,
        platform: 'Shopify',
        sync_status: 'Active',
        last_successful_sync: new Date(),
        orders_count: orders.length
      }, { merge: true });

      await batch.commit();
      res.json({ success: true, ordersCount: orders.length });
    } catch (error: any) {
      console.error("Shopify Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development - Force it for this environment
  const isDev = true; // Force dev mode to avoid dist/index.html issues
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
