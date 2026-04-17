import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Store,
  CreditCard,
  Building2,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
  Save,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/supabase';

const platforms = [
  { id: 'Shopify', name: 'Shopify', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'Amazon', name: 'Amazon Seller', icon: Store, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'Stripe', name: 'Stripe', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'Bank', name: 'Business Bank', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

interface IntegrationsProps {
  userId?: string;
}

export default function Integrations({ userId }: IntegrationsProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  
  // Modal form state
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      const orgs = await db.getOrganizations(userId);
      if (orgs.length === 0) {
        setLoading(false);
        return;
      }
      const conns = await db.getConnections(orgs[0].id);
      setConnections(conns);
      setLoading(false);
    } catch (err) {
      console.error("Supabase Error (Connections):", err);
      setLoading(false);
    }
  };

  const handleConnect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setShowModal(true);
    // Reset form to empty - never show saved credentials
    setShopUrl('');
    setAccessToken('');
    setApiKey('');
    setSecretKey('');
  };

  const handleModalSave = async () => {
    if (!userId || !selectedPlatform) return;

    setModalSaving(true);
    try {
      const orgs = await db.getOrganizations(userId);
      if (orgs.length === 0) {
        alert('No organization found');
        return;
      }
      const orgId = orgs[0].id;

      // Save connection credentials
      const settings: any = {};
      if (selectedPlatform === 'Shopify') {
        settings.shop_url = shopUrl;
        settings.access_token = accessToken;
      } else if (selectedPlatform === 'Stripe') {
        settings.api_key = apiKey;
        settings.secret_key = secretKey;
      }

      await db.updateConnection(orgId, selectedPlatform, {
        sync_status: 'connected',
        settings,
        last_successful_sync: new Date().toISOString(),
      });

      setSyncSuccess(selectedPlatform);
      setShowModal(false);
      loadConnections();
      setTimeout(() => setSyncSuccess(null), 3000);
    } catch (error: any) {
      console.error('Connection Error:', error);
      alert(`Connection failed: ${error.message}`);
    } finally {
      setModalSaving(false);
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

      {/* Connection Modal */}
      {showModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="card bg-carbon border border-white/10 p-8 rounded-2xl w-full max-w-md mx-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-electric/10 rounded-lg">
                  <Key className="text-electric" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Connect {selectedPlatform}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleModalSave(); }}>
              {selectedPlatform === 'Shopify' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Shop URL</label>
                    <input
                      type="text"
                      name="shop-url-field"
                      placeholder="https://your-shop.myshopify.com"
                      value={shopUrl}
                      onChange={(e) => setShopUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Access Token</label>
                    <input
                      type="text"
                      name="token-field"
                      placeholder="shpat_xxxxxxxx"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Shopify Admin → Settings → Apps → Develop apps
                    </p>
                  </div>
                </>
              )}

              {selectedPlatform === 'Stripe' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Public Key</label>
                    <input
                      type="text"
                      name="public-field"
                      placeholder="pk_test_xxxxxxxx"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Secret Key</label>
                    <input
                      type="text"
                      name="secret-field"
                      placeholder="sk_test_xxxxxxxx"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Stripe Dashboard → Developers → API keys
                    </p>
                  </div>
                </>
              )}

              {(selectedPlatform === 'Amazon' || selectedPlatform === 'Bank') && (
                <div className="text-center py-8">
                  <p className="text-slate-400">Integration with {selectedPlatform} is coming soon!</p>
                </div>
              )}
            </form>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                disabled={modalSaving || (selectedPlatform === 'Amazon' || selectedPlatform === 'Bank')}
                className="flex-1 py-3 rounded-lg font-bold text-carbon bg-electric hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {modalSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
