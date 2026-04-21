import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  is_featured: boolean;
  checkout_url?: string;
}

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      
      if (error) throw error;
      
      const formattedPlans = data.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        billing_period: plan.billing_period,
        features: Array.isArray(plan.features) ? plan.features : [],
        is_featured: plan.is_featured || false,
        checkout_url: plan.checkout_url || undefined,
      }));
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      // Fallback to static plans if database fails
      setPlans([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Starter',
          price: 19,
          billing_period: 'mo',
          features: ['Up to 100 transactions/month', 'Basic tax calculation', '1 store connection', 'Email support', 'Standard reports'],
          is_featured: false,
          checkout_url: 'https://taxflow.lemonsqueezy.com/checkout/buy/c8c67f51-f003-455f-ae74-fd5098c05d13',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Growth',
          price: 29,
          billing_period: 'mo',
          features: ['Unlimited transactions', 'QuickBooks & Xero sync', 'Advanced Nexus monitoring', 'IRS-ready Schedule C', 'Priority support'],
          is_featured: true,
          checkout_url: 'https://taxflow.lemonsqueezy.com/checkout/buy/b189330c-85be-4f01-9cee-a4740d9d7567',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Enterprise',
          price: 69,
          billing_period: 'mo',
          features: ['Unlimited transactions', 'Multi-currency support', 'Dedicated account manager', 'Custom integrations', '24/7 phone support'],
          is_featured: false,
          checkout_url: 'https://taxflow.lemonsqueezy.com/checkout/buy/e9e4e4cb-da7e-496c-928b-8343e330459a',
        },
      ]);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to subscribe.');
        setSubscribing(null);
        return;
      }

      // Find plan from already loaded plans (avoid second database query)
      const plan = plans.find(p => p.id === planId);

      if (!plan) {
        alert('Plan not found. Please try again.');
        setSubscribing(null);
        return;
      }

      // Check if LemonSqueezy checkout URL is configured
      if (plan.checkout_url) {
        // Redirect to LemonSqueezy checkout
        const checkoutUrl = new URL(plan.checkout_url);
        checkoutUrl.searchParams.set('checkout[email]', user.email || '');
        checkoutUrl.searchParams.set('checkout[custom][user_id]', user.id);
        window.open(checkoutUrl.toString(), '_blank');
      } else {
        // Fallback: show message that checkout is not configured
        alert('This plan is not yet available for purchase. Please contact support.');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(`حدث خطأ: ${error.message}. يرجى المحاولة مرة أخرى.`);
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Save Thousands on Accounting Costs</h2>
        <p className="text-slate-500 text-lg">Replace manual bookkeeping with automated tax compliance. Starting at just $19/month.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            whileTap={{ scale: 0.98 }}
            className={`card bg-carbon p-8 relative cursor-pointer ${
              plan.is_featured
                ? 'border-2 border-cyan-400 shadow-2xl shadow-cyan-400/20 scale-105'
                : 'border border-white/5 hover:border-white/20'
            }`}
          >
            {plan.is_featured && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-carbon px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                Most Popular
              </motion.div>
            )}
            
            <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className={`text-4xl font-black ${plan.is_featured ? 'text-cyan-400' : 'text-white'}`}>
                ${plan.price}
              </span>
              <span className="text-slate-500 font-medium">/ {plan.billing_period}</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <motion.li
                  key={featureIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 + featureIndex * 0.05 }}
                >
                  <FeatureItem text={String(feature)} />
                </motion.li>
              ))}
            </ul>
            
            <motion.button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                plan.is_featured
                  ? 'bg-cyan-400 text-carbon hover:brightness-110 shadow-xl shadow-cyan-400/20'
                  : 'border-2 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {subscribing === plan.id ? (
                <Loader2 className="animate-spin" size={20} />
              ) : plan.is_featured ? (
                <>
                  <Zap size={18} />
                  Subscribe to {plan.name}
                </>
              ) : (
                'Get Started'
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-slate-500">
        <div className="flex items-center gap-2">
          <Shield size={20} />
          <span className="text-sm font-bold">Secure SSL Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={20} />
          <span className="text-sm font-bold">Powered by LemonSqueezy</span>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-400 font-medium">
      <div className="w-5 h-5 bg-cyan-400/10 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
        <Check size={12} strokeWidth={3} />
      </div>
      <span className="text-sm">{text}</span>
    </li>
  );
}
