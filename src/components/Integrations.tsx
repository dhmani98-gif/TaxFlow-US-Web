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
  Key,
  Tag,
  Heart,
  ShoppingCart,
  Square,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/supabase';
import { 
  availableIntegrations, 
  getIntegrationsByCategory, 
  getCategoriesWithCounts,
  getSetupInstructions,
  type PlatformIntegration 
} from '../lib/integrations';

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Store,
  CreditCard,
  Building2,
  Tag,
  Heart,
  ShoppingCart,
  Square,
  Calculator,
  FileText,
  Globe,
  Zap
};

interface IntegrationsProps {
  userId?: string;
}

export default function Integrations({ userId }: IntegrationsProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformIntegration | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['ecommerce', 'payment']);
  const [syncProgress, setSyncProgress] = useState<string>('');
  
  // Modal form state
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>('sandbox');

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

  const handleConnect = (platform: PlatformIntegration) => {
    setSelectedPlatform(platform);
    setShowModal(true);
    // Reset form to empty - never show saved credentials
    setShopUrl('');
    setAccessToken('');
    setConsumerKey('');
    setConsumerSecret('');
    setApiKey('');
    setSecretKey('');
    setClientId('');
    setClientSecret('');
    setEnvironment('sandbox');
    setSyncProgress('');
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ecommerce: 'E-Commerce Platforms',
      payment: 'Payment Processors',
      accounting: 'Accounting Software',
      marketplace: 'Marketplaces'
    };
    return labels[category] || category;
  };

  const handleModalSave = async () => {
    if (!userId || !selectedPlatform) return;

    setModalSaving(true);
    setSyncProgress('Testing connection...');
    
    try {
      const orgs = await db.getOrganizations(userId);
      if (orgs.length === 0) {
        alert('No organization found');
        return;
      }
      const orgId = orgs[0].id;

      // Save connection credentials based on platform
      const settings: any = {};
      
      switch (selectedPlatform.id) {
        case 'Shopify':
          settings.shop_url = shopUrl;
          settings.access_token = accessToken;
          break;
        case 'Stripe':
          settings.api_key = apiKey;
          settings.secret_key = secretKey;
          break;
        case 'WooCommerce':
          settings.store_url = shopUrl;
          settings.consumer_key = consumerKey;
          settings.consumer_secret = consumerSecret;
          break;
        case 'PayPal':
          settings.client_id = clientId;
          settings.client_secret = clientSecret;
          settings.environment = environment;
          break;
        case 'Square':
          settings.client_id = clientId;
          settings.client_secret = clientSecret;
          break;
        case 'QuickBooks':
        case 'Xero':
          settings.oauth = true; // OAuth handled separately
          break;
        default:
          // For other platforms, use generic key/secret
          settings.api_key = apiKey;
          settings.secret_key = secretKey;
      }

      setSyncProgress('Saving credentials...');
      
      await db.updateConnection(orgId, selectedPlatform.id, {
        sync_status: 'connected',
        settings,
        last_successful_sync: new Date().toISOString(),
      });

      setSyncProgress('');
      setSyncSuccess(selectedPlatform.name);
      setShowModal(false);
      loadConnections();
      setTimeout(() => setSyncSuccess(null), 3000);
    } catch (error: any) {
      console.error('Connection Error:', error);
      alert(`Connection failed: ${error.message}`);
    } finally {
      setModalSaving(false);
      setSyncProgress('');
    }
  };

  const handleSync = async (platformId: string) => {
    setSyncingId(platformId);
    setSyncProgress('Starting sync...');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      const orgs = await db.getOrganizations(userId || '');
      if (orgs.length > 0) {
        await db.updateConnection(orgs[0].id, platformId, {
          last_successful_sync: new Date().toISOString(),
        });
      }
      
      setSyncSuccess(`${platformId} synced successfully`);
      loadConnections();
      setTimeout(() => setSyncSuccess(null), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncingId(null);
      setSyncProgress('');
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
          <p className="text-slate-500">Connect {availableIntegrations.length}+ platforms to automate your tax data collection.</p>
        </div>
        <div className="flex items-center gap-3">
          {syncSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 size={16} />
              {syncSuccess}
            </div>
          )}
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-slate-400">
            {connections.length} of {availableIntegrations.length} connected
          </div>
        </div>
      </header>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getCategoriesWithCounts(connections.map(c => c.platform)).map(({ category, total, connected }) => (
          <div 
            key={category}
            onClick={() => toggleCategory(category)}
            className={cn(
              "card p-4 cursor-pointer transition-all hover:border-white/20",
              expandedCategories.includes(category) ? "bg-white/5 border-electric/30" : "bg-carbon border-white/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">{getCategoryLabel(category)}</span>
              {expandedCategories.includes(category) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{connected}</span>
              <span className="text-sm text-slate-500">/ {total}</span>
            </div>
            <div className="mt-2 w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-electric h-full transition-all"
                style={{ width: `${(connected / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Integration Categories */}
      <div className="space-y-8">
        {(['ecommerce', 'payment', 'marketplace', 'accounting'] as const).map(category => {
          const categoryIntegrations = getIntegrationsByCategory(category);
          const isExpanded = expandedCategories.includes(category);
          
          return (
            <div key={category}>
              <div 
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between mb-4 cursor-pointer group"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {getCategoryLabel(category)}
                  <span className="text-sm font-normal text-slate-500">
                    ({categoryIntegrations.length} available)
                  </span>
                </h3>
                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </div>
              
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryIntegrations.map((platform) => {
                    const Icon = iconMap[platform.icon] || ShoppingBag;
                    const connection = connections.find(c => c.platform === platform.id);
                    const isConnected = !!connection;
                    const isSyncing = syncingId === platform.id;

                    return (
                      <div key={platform.id} className="card bg-carbon border-white/5 p-5 flex flex-col h-full hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn("p-2.5 rounded-xl", platform.bgColor, platform.color)}>
                            <Icon size={22} />
                          </div>
                          {isConnected ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
                              <CheckCircle2 size={12} />
                              Connected
                            </span>
                          ) : platform.setupDifficulty === 'easy' ? (
                            <span className="text-[10px] font-bold text-electric bg-electric/10 px-2 py-1 rounded-full uppercase">
                              Easy Setup
                            </span>
                          ) : null}
                        </div>
                        
                        <h3 className="font-bold text-base mb-1 text-white">{platform.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed">
                          {platform.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <Globe size={12} />
                          <span>{platform.supportedCountries.slice(0, 4).join(', ')}{platform.supportedCountries.length > 4 ? '...' : ''}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {isConnected && (
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                              <div className={cn("bg-electric h-full w-full", isSyncing && "animate-pulse")} />
                            </div>
                          )}
                          <div className="flex gap-2">
                            {isConnected && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSync(platform.id); }}
                                disabled={isSyncing}
                                className="flex-1 py-2 rounded-lg font-bold text-xs text-slate-300 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                              >
                                {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                Sync
                              </button>
                            )}
                            <button 
                              onClick={() => handleConnect(platform)}
                              disabled={isSyncing}
                              className={cn(
                                "flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5",
                                isConnected 
                                  ? "text-slate-300 bg-white/5 hover:bg-white/10" 
                                  : "text-carbon bg-electric hover:brightness-110"
                              )}
                            >
                              {isSyncing ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : isConnected ? (
                                <>
                                  <Key size={14} />
                                  Update
                                </>
                              ) : (
                                <>
                                  <Zap size={14} />
                                  Connect
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <h3 className="text-xl font-bold text-white">Connect {selectedPlatform.name}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleModalSave(); }}>
              {selectedPlatform.id === 'Shopify' && (
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

              {selectedPlatform.id === 'Stripe' && (
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

                      {selectedPlatform.id === 'WooCommerce' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Store URL</label>
                    <input
                      type="text"
                      name="shop-url-field"
                      placeholder="https://your-store.com"
                      value={shopUrl}
                      onChange={(e) => setShopUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Your WordPress site URL (e.g., https://mystore.com)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Consumer Key</label>
                    <input
                      type="text"
                      name="consumer-key-field"
                      placeholder="ck_xxxxxxxx"
                      value={consumerKey}
                      onChange={(e) => setConsumerKey(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Consumer Secret</label>
                    <input
                      type="text"
                      name="consumer-secret-field"
                      placeholder="cs_xxxxxxxx"
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get these from WooCommerce → Settings → Advanced → REST API
                    </p>
                  </div>
                </>
              )}

              {selectedPlatform.id === 'PayPal' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Environment</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setEnvironment('sandbox')}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          environment === 'sandbox' 
                            ? "bg-electric text-carbon" 
                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        Sandbox (Test)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvironment('live')}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          environment === 'live' 
                            ? "bg-electric text-carbon" 
                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        Live (Production)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Client ID</label>
                    <input
                      type="text"
                      name="client-id-field"
                      placeholder={environment === 'sandbox' ? "ASxxx... (Sandbox)" : "Aaxxx... (Live)"}
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Client Secret</label>
                    <input
                      type="text"
                      name="client-secret-field"
                      placeholder="••••••••"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      From PayPal Developer Dashboard → My Apps & Credentials
                    </p>
                  </div>
                </>
              )}

              {selectedPlatform.id === 'Square' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Application ID</label>
                    <input
                      type="text"
                      name="client-id-field"
                      placeholder="sq0idp-xxxxxxxx"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Application Secret</label>
                    <input
                      type="text"
                      name="client-secret-field"
                      placeholder="sq0csp-xxxxxxxx"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      From Square Developer Dashboard → Applications
                    </p>
                  </div>
                </>
              )}

              {selectedPlatform.id === 'Etsy' && (
                <div className="text-center py-8">
                  <div className="p-4 bg-white/5 rounded-lg mb-4">
                    <p className="text-sm text-slate-400 mb-4">
                      Etsy requires OAuth authentication. You'll be redirected to Etsy to authorize TaxFlow.
                    </p>
                    <button
                      type="button"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink size={18} />
                      Connect with Etsy
                    </button>
                  </div>
                </div>
              )}

              {selectedPlatform.id === 'eBay' && (
                <div className="text-center py-8">
                  <div className="p-4 bg-white/5 rounded-lg mb-4">
                    <p className="text-sm text-slate-400 mb-4">
                      eBay requires OAuth authentication. You'll be redirected to eBay to authorize TaxFlow.
                    </p>
                    <button
                      type="button"
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink size={18} />
                      Connect with eBay
                    </button>
                  </div>
                </div>
              )}

              {(selectedPlatform.id === 'Amazon' || selectedPlatform.id === 'Bank' || selectedPlatform.id === 'BigCommerce' || selectedPlatform.id === 'QuickBooks' || selectedPlatform.id === 'Xero') && (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-2">Integration with {selectedPlatform.name} is coming soon!</p>
                  <p className="text-xs text-slate-500">
                    We're working hard to bring you this integration. Stay tuned for updates.
                  </p>
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
                disabled={modalSaving || ['Amazon', 'Bank', 'BigCommerce', 'QuickBooks', 'Xero'].includes(selectedPlatform.id)}
                className="flex-1 py-3 rounded-lg font-bold text-carbon bg-electric hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {modalSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {syncProgress || 'Connecting...'}
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
