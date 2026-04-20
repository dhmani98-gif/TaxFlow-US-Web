const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.raw({ type: 'application/json' }));

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for webhook
const supabase = createClient(supabaseUrl, supabaseKey);

// LemonSqueezy webhook secret
const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

app.post('/api/webhook/lemonsqueezy', async (req, res) => {
  try {
    // Get the signature from the header
    const signature = req.headers['x-signature'];
    
    if (!signature) {
      console.error('Missing signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify the signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(req.body);
    const digest = hmac.digest('hex');

    if (signature !== digest) {
      console.error('Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the webhook event
    const event = JSON.parse(req.body.toString());
    console.log('LemonSqueezy webhook event:', event);

    const { meta, data } = event;
    const eventName = meta.event_name;
    const customData = data.attributes.first_order_item.attributes.first_subscription_item.attributes.custom_data || {};

    const userId = customData.user_id;
    const subscriptionId = data.id;
    const orderId = data.attributes.first_order_item.order_id;

    if (!userId) {
      console.error('Missing user_id in custom_data');
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // Handle different webhook events
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
        // Update subscription status to active
        await updateSubscriptionStatus(userId, 'active', subscriptionId);
        console.log(`Subscription activated for user ${userId}`);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        // Update subscription status to expired
        await updateSubscriptionStatus(userId, 'expired', subscriptionId);
        console.log(`Subscription expired for user ${userId}`);
        break;

      case 'subscription_payment_success':
        // Payment successful - ensure subscription is active
        await updateSubscriptionStatus(userId, 'active', subscriptionId);
        console.log(`Payment successful for user ${userId}`);
        break;

      case 'subscription_payment_failed':
        // Payment failed - could warn user but keep active for now
        console.log(`Payment failed for user ${userId}`);
        break;

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function updateSubscriptionStatus(userId, status, lemonsqueezySubscriptionId) {
  try {
    // Update profile subscription status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_status: status })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    // Update or create subscription record
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (existingSub) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          lemonsqueezy_subscription_id: lemonsqueezySubscriptionId,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', userId);
    } else {
      // Create new subscription
      // Get the plan_id from the subscription data if available
      const planId = data?.attributes?.variant_id || null;
      
      await supabase
        .from('subscriptions')
        .insert({
          profile_id: userId,
          plan_id: planId,
          status: status,
          lemonsqueezy_subscription_id: lemonsqueezySubscriptionId,
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    console.log(`Subscription status updated to ${status} for user ${userId}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`LemonSqueezy webhook server running on port ${PORT}`);
});
