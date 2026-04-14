import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  CreditCard, 
  ShoppingBag,
  Save,
  Loader2
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Currency & Tax settings
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(15);

  // API Keys
  const [shopifyShopUrl, setShopifyShopUrl] = useState('');
  const [shopifyAccessToken, setShopifyAccessToken] = useState('');
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'config'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setCurrency(data.currency || 'USD');
          setTaxRate(data.taxRate || 15);
          setShopifyShopUrl(data.shopifyShopUrl || '');
          setShopifyAccessToken(data.shopifyAccessToken || '');
          setStripePublicKey(data.stripePublicKey || '');
          setStripeSecretKey(data.stripeSecretKey || '');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }

      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'config'), {
        currency,
        taxRate,
        shopifyShopUrl,
        shopifyAccessToken,
        stripePublicKey,
        stripeSecretKey,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
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
      <header>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-slate-500">Manage your account preferences and integrations.</p>
      </header>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'profile' 
                ? 'bg-electric text-carbon' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <User size={18} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'tax' 
                ? 'bg-electric text-carbon' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <SettingsIcon size={18} />
            Currency & Tax
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'integrations' 
                ? 'bg-electric text-carbon' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Key size={18} />
            API Keys
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card bg-carbon border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-electric/10 rounded-xl">
                  <User className="text-electric" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Profile Information</h3>
                  <p className="text-sm text-slate-500">Update your personal details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="card bg-carbon border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-electric/10 rounded-xl">
                  <Globe className="text-electric" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Currency & Tax Settings</h3>
                  <p className="text-sm text-slate-500">Configure your business currency and tax rates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Estimated Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Used for tax estimation calculations</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card bg-carbon border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-electric/10 rounded-xl">
                  <Key className="text-electric" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">API Keys & Integrations</h3>
                  <p className="text-sm text-slate-500">Manage your third-party service credentials</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Shopify */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="text-green-500" size={20} />
                    <h4 className="font-bold text-white">Shopify Integration</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Shop URL</label>
                    <input
                      type="text"
                      placeholder="https://your-shop.myshopify.com"
                      value={shopifyShopUrl}
                      onChange={(e) => setShopifyShopUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Access Token</label>
                    <input
                      type="password"
                      placeholder="shpat_xxxxxxxx"
                      value={shopifyAccessToken}
                      onChange={(e) => setShopifyAccessToken(e.target.value)}
                      className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Shopify Admin → Settings → Apps and sales channels → Develop apps → Create custom app
                    </p>
                  </div>
                </div>

                {/* Stripe */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-indigo-500" size={20} />
                    <h4 className="font-bold text-white">Stripe Integration</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Public Key</label>
                    <input
                      type="text"
                      placeholder="pk_test_xxxxxxxx"
                      value={stripePublicKey}
                      onChange={(e) => setStripePublicKey(e.target.value)}
                      className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Secret Key</label>
                    <input
                      type="password"
                      placeholder="sk_test_xxxxxxxx"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Stripe Dashboard → Developers → API keys
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-electric text-carbon rounded-lg font-black hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
