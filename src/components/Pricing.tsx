import React, { useState, useEffect } from 'react';
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

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
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
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Save Thousands on Accounting Costs</h2>
        <p className="text-slate-500 text-lg">Replace manual bookkeeping with automated tax compliance. Starting at just $19/month.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card bg-carbon p-8 relative transition-all ${
              plan.is_featured
                ? 'border-2 border-cyan-400 shadow-2xl shadow-cyan-400/20 scale-105'
                : 'border border-white/5 hover:border-white/10'
            }`}
          >
            {plan.is_featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-carbon px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className={`text-4xl font-black ${plan.is_featured ? 'text-cyan-400' : 'text-white'}`}>
                ${plan.price}
              </span>
              <span className="text-slate-500 font-medium">/ {plan.billing_period}</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <FeatureItem text={String(feature)} />
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing !== null}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                plan.is_featured
                  ? 'bg-cyan-400 text-carbon hover:brightness-110 shadow-xl shadow-cyan-400/20'
                  : 'border-2 border-white/5 text-slate-400 hover:bg-white/5'
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
            </button>
          </div>
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
    </div>
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
