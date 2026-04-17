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
import { Bell, User, Search, LogIn, Loader2 } from 'lucide-react';
import { auth, db } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string; photoURL?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard userId={user?.uid} />;
      case 'integrations': return <Integrations userId={user?.uid} />;
      case 'transactions': return <Transactions userId={user?.uid} />;
      case 'reports': return <Reports userId={user?.uid} />;
      case 'pricing': return <Pricing />;
      case 'settings': return <Settings userId={user?.uid} />;
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

  if (!user) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onShowLogin={() => setShowLogin(true)} />;
  }

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-carbon flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 ml-64 min-h-screen flex flex-col">
          {/* Top Header */}
          <header className="h-20 bg-carbon border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-20">
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

