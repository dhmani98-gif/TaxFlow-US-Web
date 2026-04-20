import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Integrations from './components/Integrations';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Pricing from './components/Pricing';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Cookies from './components/Cookies';
import { Bell, User, Search, LogIn, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { auth, db } from './lib/supabase';
import { checkSubscriptionStatus } from './lib/subscriptionCheck';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string; photoURL?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [marketingPage, setMarketingPage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'trialing' | 'active' | 'expired' | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);

  // Check for redirect query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect === 'dashboard' && !showLogin) {
      setShowLogin(true);
    }
  }, []);

  useEffect(() => {
    // Check auth state with Supabase
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session);

      if (session?.user) {
        const user = session.user;
        setUser({
          uid: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0],
        });

        // Check subscription status (with error handling)
        try {
          const status = await checkSubscriptionStatus();
          setSubscriptionStatus(status.status);
          setTrialExpired(!status.canAccess && status.status === 'expired');
        } catch (error) {
          console.error('Subscription check error:', error);
          // Default to trialing if check fails (allow access)
          setSubscriptionStatus('trialing');
          setTrialExpired(false);
        }

        // Create organization in background (non-blocking)
        db.getOrganizations(user.id)
          .then(orgs => {
            if (orgs.length === 0) {
              return db.createOrganization({
                profile_id: user.id,
                name: 'My Business',
                tax_year: new Date().getFullYear(),
              });
            }
          })
          .catch(err => {
            console.error('Organization creation error:', err);
          });
      } else {
        setUser(null);
        setSubscriptionStatus(null);
        setTrialExpired(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderContent = () => {
    // If trial expired and not on pricing page, show pricing
    if (trialExpired && activeTab !== 'pricing') {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-2xl text-center mb-8">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">انتهت الفترة التجريبية</h2>
            <p className="text-slate-400 mb-6">
              انتهت فترة التجربة المجانية البالغة 14 يوماً. يرجى الاشتراك في أحد الباقات للمتابعة.
            </p>
            <button
              onClick={() => setActiveTab('pricing')}
              className="bg-electric text-carbon px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
            >
              الاشتراك الآن
            </button>
          </div>
          <Pricing />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard userId={user?.uid} />;
      case 'integrations': return <Integrations userId={user?.uid} />;
      case 'transactions': return <Transactions userId={user?.uid} />;
      case 'reports': return <Reports userId={user?.uid} />;
      case 'pricing': return <Pricing />;
      case 'settings': return <Settings userId={user?.uid} />;
      case 'features': return <Features />;
      case 'how-it-works': return <HowItWorks />;
      case 'privacy': return <Privacy />;
      case 'terms': return <Terms />;
      case 'cookies': return <Cookies />;
      default: return <Dashboard userId={user?.uid} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center">
        <Loader2 className="animate-spin text-electric" size={48} />
      </div>
    );
  }

  // Show marketing pages without login
  if (marketingPage) {
    const MarketingComponent = {
      'features': Features,
      'how-it-works': HowItWorks,
      'pricing': Pricing,
      'privacy': Privacy,
      'terms': Terms,
      'cookies': Cookies,
    }[marketingPage];

    if (MarketingComponent) {
      return (
        <div className="min-h-screen bg-carbon">
          <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-carbon/80 backdrop-blur-md z-50">
            <button onClick={() => setMarketingPage(null)} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-electric rounded-xl flex items-center justify-center shadow-lg shadow-electric/20">
                <TrendingUp className="text-carbon" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter leading-none">TAXFLOW</h1>
                <span className="text-[10px] font-bold text-electric tracking-[0.2em] uppercase">United States</span>
              </div>
            </button>
            <button 
              onClick={() => { setShowLogin(true); setMarketingPage(null); }}
              className="bg-electric text-carbon px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-electric/20"
            >
              Sign In
            </button>
          </nav>
          <MarketingComponent />
        </div>
      );
    }
  }

  if (!user) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onShowLogin={() => setShowLogin(true)} onNavigate={(page) => setMarketingPage(page)} />;
  }

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-carbon flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 ml-64 min-h-screen flex flex-col">
          {/* Top Header */}
          <header className="bg-carbon border-b border-white/5 px-8 flex flex-col sticky top-0 z-20">
            {/* Trial Banner */}
            {subscriptionStatus === 'trialing' && (
              <div className="bg-electric/10 border-b border-electric/20 px-8 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-electric" size={16} />
                  <span className="text-sm font-medium text-electric">
                    فترة تجريبية مجانية - 14 يوم
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="text-sm font-bold text-electric hover:underline"
                >
                  الاشتراك الآن
                </button>
              </div>
            )}
            <div className="h-20 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96 hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-electric rounded-full border-2 border-carbon"></span>
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-carbon border border-electric/30 rounded-xl shadow-xl shadow-electric/20 z-50">
                      <div className="p-4 border-b border-white/5">
                        <h4 className="font-bold text-white">Notifications</h4>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-500 text-center">No new notifications</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-8 w-px bg-white/5"></div>

                <div className="flex items-center gap-3 cursor-pointer group" onClick={async () => { await auth.signOut(); setUser(null); }}>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white group-hover:text-electric transition-colors">{user.displayName || 'User'}</p>
                    <p className="text-xs font-medium text-slate-500">Sign Out</p>
                  </div>
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white/5 group-hover:border-electric transition-all"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <div className="p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </Provider>
  );
}

function ShieldCheck({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

