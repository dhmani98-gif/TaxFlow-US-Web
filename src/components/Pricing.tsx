import React, { useState } from 'react';
import { Check, Zap, Shield, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

export default function Pricing() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to subscribe.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          planId: planId 
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // IMPORTANT: Open in a new tab to avoid iframe restrictions
        const stripeWindow = window.open(data.url, '_blank');
        
        // Fallback if popup is blocked by browser
        if (!stripeWindow || stripeWindow.closed || typeof stripeWindow.closed === 'undefined') {
          window.location.href = data.url;
        }
      } else {
        const errorMsg = data.error || 'Unknown error';
        alert(`Stripe Error: ${errorMsg}`);
      }
    } catch (error: any) {
      alert(`Connection Error: ${error.message}. Please check if the server is running.`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-slate-500 text-lg">Choose the plan that fits your business scale. All plans include automated tax tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className="card bg-carbon border-white/5 p-8 hover:border-white/10 transition-all">
          <h3 className="text-xl font-bold mb-2 text-white">Starter</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black text-white">$29</span>
            <span className="text-slate-500 font-medium">/ mo</span>
          </div>
          <ul className="space-y-4 mb-8">
            <FeatureItem text="Up to 500 transactions/mo" />
            <FeatureItem text="Basic Nexus monitoring" />
            <FeatureItem text="1 Shopify store connection" />
            <FeatureItem text="Email support" />
          </ul>
          <button 
            onClick={() => handleSubscribe('Starter')}
            disabled={loading}
            className="w-full py-3 rounded-xl border-2 border-white/5 font-bold text-slate-400 hover:bg-white/5 transition-all"
          >
            Get Started
          </button>
        </div>

        {/* Growth Plan - Featured */}
        <div className="card bg-carbon p-8 border-2 border-electric relative shadow-2xl shadow-electric/10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-electric text-carbon px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Most Popular
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Growth</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black text-electric">$79</span>
            <span className="text-slate-500 font-medium">/ mo</span>
          </div>
          <ul className="space-y-4 mb-8">
            <FeatureItem text="Unlimited transactions" />
            <FeatureItem text="Advanced Nexus Sentinel" />
            <FeatureItem text="Amazon, Shopify & Stripe" />
            <FeatureItem text="IRS-ready Schedule C" />
            <FeatureItem text="Priority CPA support" />
          </ul>
          <button 
            onClick={() => handleSubscribe('Growth')}
            disabled={loading}
            className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-electric/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
            Subscribe to Growth
          </button>
        </div>
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
      <div className="w-5 h-5 bg-electric/10 text-electric rounded-full flex items-center justify-center flex-shrink-0">
        <Check size={12} strokeWidth={3} />
      </div>
      <span className="text-sm">{text}</span>
    </li>
  );
}
