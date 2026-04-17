require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Get plan details from Supabase
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      metadata: {
        userId,
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const { userId, planId } = session.metadata;

      // Ensure profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profile) {
        const { data: { user } } = await supabase.auth.getUser(userId);
        if (user) {
          await supabase.from('profiles').insert({
            id: userId,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          });
        }
      }

      // Create subscription record
      await supabase.from('subscriptions').insert({
        profile_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: new Date().toISOString(),
        stripe_subscription_id: session.subscription,
      });

      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
  }

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const { userId, planId } = session.metadata;

      if (userId && planId) {
        try {
          // Ensure profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

          if (!profile) {
            const { data: { user } } = await supabase.auth.getUser(userId);
            if (user) {
              await supabase.from('profiles').insert({
                id: userId,
                email: user.email,
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
              });
            }
          }

          // Create subscription record
          await supabase.from('subscriptions').insert({
            profile_id: userId,
            plan_id: planId,
            status: 'active',
            start_date: new Date().toISOString(),
            stripe_subscription_id: session.subscription,
          });

          console.log(`Subscription activated for user ${userId}, plan ${planId}`);
        } catch (error) {
          console.error('Error processing subscription:', error);
        }
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      try {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', end_date: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id);

        console.log(`Subscription ${subscription.id} cancelled`);
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
