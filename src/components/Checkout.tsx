import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface CheckoutProps {
  planName: string;
  planPrice: number;
  planFeatures: string[];
}

export default function Checkout({ planName, planPrice, planFeatures }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message || 'Payment failed');
      setLoading(false);
    } else {
      // Here you would send paymentMethod.id to your backend
      console.log('PaymentMethod:', paymentMethod);
      setSucceeded(true);
      setLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-carbon border border-electric/30 rounded-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-electric/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="text-electric" size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-400">مرحباً بك في مستقبل المحاسبة المؤتمتة</p>
          </div>
          <button className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all">
            ابدأ بربط متجرك على Shopify الآن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Plan Details */}
        <div className="bg-carbon border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">{planName} Plan</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-electric">${planPrice}</span>
              <span className="text-slate-500 font-medium text-xl">/ mo</span>
            </div>
          </div>

          <div className="space-y-4">
            {planFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-electric/10 text-electric rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Lock size={16} />
              <span>Secure SSL Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="bg-carbon border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
            <p className="text-slate-500 text-sm">Complete your purchase securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Card Information</label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        color: '#ffffff',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                          color: '#64748b',
                        },
                      },
                      invalid: {
                        color: '#ef4444',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || loading}
              className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-electric/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Pay ${planPrice}
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Lock size={14} />
              <span>Your payment is secured by Stripe</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
