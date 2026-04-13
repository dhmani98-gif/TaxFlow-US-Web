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
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    dbAdmin = admin.firestore(firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("Firebase Admin Initialization Error:", error.message);
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
      
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        metadata: {
          userId: userId || 'anonymous',
          planId: planId || 'growth',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `TaxFlow US - ${planId || 'Growth'} Plan`,
                description: 'Unlimited transactions & Advanced Nexus Sentinel',
              },
              unit_amount: planId === 'Enterprise' ? 19900 : 7900,
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

  // Shopify Simulation API
  app.post("/api/simulate-shopify-sync", async (req, res) => {
    if (!dbAdmin) {
      return res.status(500).json({ error: "Firebase Admin not initialized. Check server logs." });
    }
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID is required" });

      const orgId = userId; // Using UID as orgId for demo
      const batch = dbAdmin.batch();

      // 1. Create Organization if not exists
      const orgRef = dbAdmin.collection('organizations').doc(orgId);
      const orgDoc = await orgRef.get();
      if (!orgDoc.exists) {
        batch.set(orgRef, {
          owner_id: orgId,
          legal_name: 'My TaxFlow Org',
          entity_type: 'LLC',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 2. Create Connection
      const connRef = dbAdmin.collection(`organizations/${orgId}/connections`).doc('shopify_sim');
      batch.set(connRef, {
        org_id: orgId,
        platform: 'Shopify',
        sync_status: 'Active',
        last_successful_sync: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Create Mock Transactions
      const states = ['CA', 'TX', 'NY', 'FL', 'WA'];
      for (let i = 0; i < 10; i++) {
        const txRef = dbAdmin.collection(`organizations/${orgId}/transactions`).doc();
        const amount = Math.floor(Math.random() * 5000) + 100;
        batch.set(txRef, {
          org_id: orgId,
          amount: amount,
          transaction_date: admin.firestore.FieldValue.serverTimestamp(),
          state_code: states[Math.floor(Math.random() * states.length)],
          platform: 'Shopify',
          description: `Shopify Order #${1000 + i}`,
          tax_amount: amount * 0.08,
        });
      }

      // 3. Update Nexus Status (Mock)
      const nexusStates = [
        { code: 'CA', name: 'California', threshold: 100000 },
        { code: 'NY', name: 'New York', threshold: 100000 },
      ];

      for (const state of nexusStates) {
        const nexusRef = dbAdmin.collection(`organizations/${orgId}/nexus`).doc(state.code);
        const totalSales = Math.floor(Math.random() * 120000);
        batch.set(nexusRef, {
          org_id: orgId,
          state_code: state.code,
          state_name: state.name,
          total_sales: totalSales,
          threshold_amount: state.threshold,
          status: totalSales > state.threshold ? 'EXCEEDED' : (totalSales > state.threshold * 0.8 ? 'WARNING' : 'SAFE'),
        });
      }

      await batch.commit();
      res.json({ success: true, message: "Shopify simulation synced successfully" });
    } catch (error: any) {
      console.error("Simulation Error:", error.message);
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
