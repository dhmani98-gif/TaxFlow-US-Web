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
      }));
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      // Fallback to static plans if database fails
      setPlans([
        {
          id: '1',
          name: 'Starter',
          price: 19,
          billing_period: 'mo',
          features: ['Up to 100 transactions/month', 'Basic tax calculation', '1 store connection', 'Email support', 'Standard reports'],
          is_featured: false,
        },
        {
          id: '2',
          name: 'Growth',
          price: 49,
          billing_period: 'mo',
          features: ['Unlimited transactions', 'QuickBooks & Xero sync', 'Advanced Nexus monitoring', 'IRS-ready Schedule C', 'Priority support'],
          is_featured: true,
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 99,
          billing_period: 'mo',
          features: ['Unlimited transactions', 'Multi-currency support', 'Dedicated account manager', 'Custom integrations', '24/7 phone support'],
          is_featured: false,
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

      // Ensure profile exists (fallback for users created before trigger)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          });

        if (profileError) {
          alert('Error creating profile. Please try logging out and back in.');
          setSubscribing(null);
          return;
        }
      }

      // Check if user already has an active subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        alert('You already have an active subscription. Please cancel it first.');
        setSubscribing(null);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch('http://localhost:3002/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId }),
      });

      const data = await response.json();

      if (data.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      if (error.message.includes('fetch')) {
        alert('هناك مشكلة مؤقتة في الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع الدعم الفني.');
      } else {
        alert(`حدث خطأ: ${error.message}. يرجى المحاولة مرة أخرى.`);
      }
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
          <span className="text-sm font-bold">Powered by Stripe</span>
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
