import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import { MongoClient, Db } from "mongodb";

dotenv.config();

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxflow';
const DB_NAME = 'taxflow';
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function connectToMongoDB(): Promise<Db> {
  if (mongoDb) return mongoDb;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db(DB_NAME);
    console.log('✅ MongoDB connected successfully');
    return mongoDb;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TLXzIEgWCgUtDAp6YMy62ehMooDlgQ656Hl8iR5sZteiRoz0sHyXw0k2nLVsUgVKygN2hWNMRXvQHbpeYJDij5M00CRyathLe');

async function startServer() {
  const app = express();
  const PORT = 3001;

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
    res.json({ status: "ok", mongo: mongoDb ? "connected" : "disconnected" });
  });

  // MongoDB Auth API
  app.post("/api/auth/login", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const { email, password } = req.body;
      
      const user = await db.collection('users').findOne({ email, password });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        uid: user._id.toString(),
        email: user.email,
        displayName: user.displayName
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const { email, password, displayName } = req.body;
      
      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const result = await db.collection('users').insertOne({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date()
      });
      
      res.json({
        uid: result.insertedId.toString(),
        email,
        displayName: displayName || email.split('@')[0]
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // MongoDB Transactions API
  app.get("/api/transactions/:orgId", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const { orgId } = req.params;
      
      const transactions = await db.collection('transactions')
        .find({ org_id: orgId })
        .sort({ transaction_date: -1 })
        .toArray();
      
      res.json(transactions.map(t => ({ ...t, id: t._id.toString() })));
    } catch (error: any) {
      console.error('Transactions error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const transaction = req.body;
      
      const result = await db.collection('transactions').insertOne({
        ...transaction,
        createdAt: new Date()
      });
      
      res.json({ id: result.insertedId.toString(), ...transaction });
    } catch (error: any) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // MongoDB Nexus API
  app.get("/api/nexus/:orgId", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const { orgId } = req.params;
      
      const nexus = await db.collection('nexus')
        .find({ org_id: orgId })
        .toArray();
      
      res.json(nexus.map(n => ({ ...n, id: n._id.toString() })));
    } catch (error: any) {
      console.error('Nexus error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // MongoDB Connections API
  app.get("/api/connections/:orgId", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const { orgId } = req.params;
      
      const connections = await db.collection('connections')
        .find({ org_id: orgId })
        .toArray();
      
      res.json(connections.map(c => ({ ...c, id: c._id.toString() })));
    } catch (error: any) {
      console.error('Connections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const connection = req.body;
      
      await db.collection('connections').updateOne(
        { org_id: connection.org_id, platform: connection.platform },
        { $set: { ...connection, updatedAt: new Date() } },
        { upsert: true }
      );
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Update connection error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Log all registered routes for debugging
  console.log('✅ API Routes registered');
  
  // Global error handler - MUST be before Vite middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.path });
  });

  // Vite middleware for development - MUST be after all API routes
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
