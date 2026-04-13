import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Store, 
  CreditCard, 
  Building2, 
  RefreshCw, 
  CheckCircle2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const platforms = [
  { id: 'Shopify', name: 'Shopify', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'Amazon', name: 'Amazon Seller', icon: Store, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'Stripe', name: 'Stripe', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'Bank', name: 'Business Bank', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

export default function Integrations() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const orgId = user.uid;
    const connQuery = collection(db, `organizations/${orgId}/connections`);

    const unsub = onSnapshot(connQuery, (snapshot) => {
      const conns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConnections(conns);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Connections):", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleConnect = async (platformId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setSyncingId(platformId);
    setSyncSuccess(null);
    try {
      if (platformId === 'Shopify') {
        const response = await fetch('/api/simulate-shopify-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid }),
        });
        const data = await response.json();
        if (data.success) {
          setSyncSuccess(`Successfully synced ${platformId} data!`);
          setTimeout(() => setSyncSuccess(null), 5000);
        }
      } else {
        alert(`Integration with ${platformId} is coming soon! Try Shopify for the demo.`);
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-electric" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Integration Center</h2>
          <p className="text-slate-500">Connect your platforms to automate data collection (Simulation Mode).</p>
        </div>
        {syncSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            {syncSuccess}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platforms.map((platform) => {
          const connection = connections.find(c => c.platform === platform.id);
          const isConnected = !!connection;
          const isSyncing = syncingId === platform.id;

          return (
            <div key={platform.id} className="card bg-carbon border-white/5 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl", platform.bg, platform.color)}>
                  <platform.icon size={24} />
                </div>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-full uppercase">
                    Not Linked
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-1 text-white">{platform.name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                {isConnected 
                  ? `Last synced ${connection.last_successful_sync?.toDate ? connection.last_successful_sync.toDate().toLocaleDateString() : 'Just now'}`
                  : `Sync your ${platform.name} orders and fees automatically.`}
              </p>
              
              <div className="space-y-3">
                {isConnected && (
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className={cn("bg-electric h-full w-full", isSyncing && "animate-pulse")} />
                  </div>
                )}
                <button 
                  onClick={() => handleConnect(platform.id)}
                  disabled={isSyncing}
                  className={cn(
                  "w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                  isConnected 
                    ? "bg-white/5 text-slate-300 hover:bg-white/10" 
                    : "bg-electric text-carbon hover:brightness-110"
                )}>
                  {isSyncing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : isConnected ? (
                    <>
                      <RefreshCw size={16} />
                      Sync Now
                    </>
                  ) : (
                    <>
                      Connect Account
                      <ExternalLink size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-8 bg-carbon border-white/5 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-4 tracking-tight">Security & Encryption</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Your credentials are never stored on our servers. We use <strong>AWS Secrets Manager</strong> 
            and <strong>AES-256 encryption</strong> to ensure your data remains isolated and secure. 
            All connections use OAuth 2.0 or restricted API keys.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <CheckCircle2 size={18} className="text-electric" />
              <span className="text-sm font-bold">SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <CheckCircle2 size={18} className="text-electric" />
              <span className="text-sm font-bold">AES-256 Bit Encryption</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4">
          <RefreshCw size={300} className="text-electric" />
        </div>
      </div>
    </div>
  );
}
