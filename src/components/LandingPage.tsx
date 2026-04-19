import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag, 
  Store, 
  FileText,
  MousePointerClick,
  Link as LinkIcon,
  Shield,
  CreditCard
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LandingPageProps {
  onShowLogin: () => void;
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onShowLogin, onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-carbon text-white font-sans selection:bg-electric/30">
      {/* Navigation */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-carbon/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-electric rounded-xl flex items-center justify-center shadow-lg shadow-electric/20">
            <TrendingUp className="text-carbon" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">TAXFLOW</h1>
            <span className="text-[10px] font-bold text-electric tracking-[0.2em] uppercase">United States</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
          <button onClick={() => onNavigate('features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
          <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">Pricing</button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onShowLogin}
            className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onShowLogin}
            className="bg-electric text-carbon px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-electric/20"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section - Carbon Theme */}
      <section className="bg-carbon py-32 px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-electric rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
              TaxFlow US | <br/>
              <span className="text-electric">US Tax Accounting Made Easier.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Don't waste your time on complex tables. We connect your Shopify and Amazon sales and prepare your IRS reports with the click of a button.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <button 
                onClick={onShowLogin}
                className="bg-electric text-carbon px-10 py-5 rounded-2xl font-black text-xl hover:brightness-110 transition-all shadow-2xl shadow-electric/30 flex items-center justify-center gap-3"
              >
                Start Your Journey for $19/mo
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section - Table Style */}
      <section className="py-24 bg-[#0f0f0f] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-8">
          <div className="card bg-[#151515] border-electric/20 shadow-2xl shadow-electric/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-8 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Value Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6 font-bold text-white">Sales Tax Automation</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black uppercase">
                      Active ✅
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-400 font-medium">Saving 20 hours of work per month</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6 font-bold text-white">Amazon SP-API Sync</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black uppercase">
                      Active ✅
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-400 font-medium">Real-time data processing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Choose the plan that fits your business scale. Starting at just $19/month.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-[#111] rounded-[3rem] p-8 text-white border border-white/5 hover:border-electric/20 transition-all">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black mb-4">Starter</h3>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-6xl font-black text-white">$19</span>
                  <span className="text-slate-400 font-bold">/ month</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all mb-8"
              >
                Get Started
              </button>
              <div className="space-y-4">
                <CheckItem text="Up to 100 transactions/month" />
                <CheckItem text="Basic tax calculation" />
                <CheckItem text="1 store connection" />
                <CheckItem text="Email support" />
                <CheckItem text="Standard reports" />
              </div>
            </div>

            {/* Growth Plan */}
            <div className="bg-[#111] rounded-[3rem] p-8 text-white border-2 border-electric relative overflow-hidden shadow-2xl shadow-electric/20 scale-105">
              <div className="absolute top-4 right-4 bg-electric text-carbon text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black mb-4 text-electric">Growth</h3>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-6xl font-black text-electric">$49</span>
                  <span className="text-slate-400 font-bold">/ month</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="w-full bg-electric text-carbon py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all mb-8 shadow-xl shadow-electric/20"
              >
                Subscribe to Growth
              </button>
              <div className="space-y-4">
                <CheckItem text="Unlimited transactions" />
                <CheckItem text="QuickBooks & Xero sync" />
                <CheckItem text="Advanced Nexus monitoring" />
                <CheckItem text="IRS-ready Schedule C" />
                <CheckItem text="Priority support" />
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#111] rounded-[3rem] p-8 text-white border border-white/5 hover:border-electric/20 transition-all">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black mb-4">Enterprise</h3>
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-6xl font-black text-white">$99</span>
                  <span className="text-slate-400 font-bold">/ month</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all mb-8"
              >
                Contact Sales
              </button>
              <div className="space-y-4">
                <CheckItem text="Unlimited transactions" />
                <CheckItem text="Multi-currency support" />
                <CheckItem text="Dedicated account manager" />
                <CheckItem text="Custom integrations" />
                <CheckItem text="24/7 phone support" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-electric rounded-xl flex items-center justify-center shadow-lg shadow-electric/20">
                  <TrendingUp className="text-carbon" size={24} />
                </div>
                <h1 className="text-xl font-black tracking-tighter leading-none">TAXFLOW</h1>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Empowering Amazon and Shopify sellers with automated tax compliance and intelligent accounting solutions.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-widest text-xs">Quick Links</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-500">
                <li><button onClick={() => onNavigate('features')} className="hover:text-electric transition-colors">Features</button></li>
                <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-electric transition-colors">How it Works</button></li>
                <li><button onClick={() => onNavigate('pricing')} className="hover:text-electric transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-500">
                <li><button onClick={() => onNavigate('terms')} className="hover:text-electric transition-colors">Terms & Conditions</button></li>
                <li><button onClick={() => onNavigate('privacy')} className="hover:text-electric transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('cookies')} className="hover:text-electric transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-bold text-slate-500">© 2026 TaxFlow US. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-electric/20 hover:shadow-2xl transition-all duration-500 group">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-electric/10 transition-all duration-500">
        {React.cloneElement(icon as React.ReactElement, { size: 32, className: 'text-electric' })}
      </div>
      <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative group">
      <div className="text-9xl font-black text-white/[0.03] absolute -top-16 -left-8 z-0 group-hover:text-electric/5 transition-colors duration-500">{number}</div>
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 bg-electric/20 text-electric rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={14} />
      </div>
      <span className="font-bold text-slate-300">{text}</span>
    </div>
  );
}
