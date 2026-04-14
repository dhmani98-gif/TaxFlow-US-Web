import React from 'react';
import { Check, ArrowRight, ShoppingBag, Shield } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-carbon border border-electric/30 rounded-2xl p-12 text-center space-y-8">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-electric/10 rounded-full flex items-center justify-center mx-auto">
          <Check className="text-electric" size={48} />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-400">
            Welcome to the future of automated accounting
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-electric/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="text-electric" size={24} />
            </div>
            <h3 className="font-bold text-white mb-1">Connect Stores</h3>
            <p className="text-sm text-slate-500">Link Shopify & Amazon</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-electric/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="text-electric" size={24} />
            </div>
            <h3 className="font-bold text-white mb-1">Auto Tax Reports</h3>
            <p className="text-sm text-slate-500">Schedule C & 1099-NEC</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-electric/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Check className="text-electric" size={24} />
            </div>
            <h3 className="font-bold text-white mb-1">Nexus Tracking</h3>
            <p className="text-sm text-slate-500">Multi-state compliance</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => window.location.href = '/integrations'}
          className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-electric/20"
        >
          Start connecting your Shopify store now
          <ArrowRight size={20} />
        </button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm pt-4">
          <Shield size={16} />
          <span>Secure payment processed by Stripe</span>
        </div>
      </div>
    </div>
  );
}
