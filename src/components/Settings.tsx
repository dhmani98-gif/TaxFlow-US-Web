import React, { useState, useEffect } from 'react';
import { User, Save, Loader2, Globe, Settings as SettingsIcon } from 'lucide-react';
import { auth, db } from '../lib/supabase';

interface SettingsProps {
  userId?: string;
}

export default function Settings({ userId }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // Business settings
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(15);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const profile = await db.getProfile(userId);
        if (profile) {
          setDisplayName(profile.display_name || '');
          setEmail(profile.email || '');
          setBusinessName(profile.business_name || '');
          setTaxId(profile.tax_id || '');
          setCurrency(profile.business_address?.currency || 'USD');
          setTaxRate(profile.business_address?.taxRate || 15);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      await db.updateProfile(userId, {
        display_name: displayName,
        business_name: businessName,
        tax_id: taxId,
        business_address: {
          currency,
          taxRate,
        },
      });

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
        <p className="text-slate-500">Manage your account and business preferences.</p>
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
            onClick={() => setActiveTab('business')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'business' 
                ? 'bg-electric text-carbon' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Globe size={18} />
            Business Settings
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

          {activeTab === 'business' && (
            <div className="card bg-carbon border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-electric/10 rounded-xl">
                  <SettingsIcon className="text-electric" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Business Settings</h3>
                  <p className="text-sm text-slate-500">Configure your business details and tax preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="My Business LLC"
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Tax ID (EIN/SSN)</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className="w-full px-4 py-3 bg-carbon border border-electric/50 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Your business tax identification number</p>
                </div>

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
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-electric text-carbon py-3 rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
