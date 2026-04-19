import React from 'react';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-carbon py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-electric/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-electric" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Your sales data is encrypted using industry-standard AES-256 encryption. 
              We never share your financial information with third parties. Your data 
              is stored securely in compliance with SOC 2 Type II standards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Lock className="text-electric" size={20} />
                <span className="text-slate-300">256-bit encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <Database className="text-electric" size={20} />
                <span className="text-slate-300">SOC 2 Type II compliant</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Collection</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We only collect the data necessary to provide tax calculation services:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <Eye className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Transaction data (amounts, dates, locations)</span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Store connection details (encrypted)</span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Account information for authentication</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Sharing</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We do not sell, rent, or share your data with any third parties. 
              Your data is used exclusively for:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Tax calculation and reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Service improvement and maintenance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Legal compliance requirements</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              You have the right to:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Access your data at any time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Request deletion of your data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Export your data in standard formats</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-electric font-bold">•</span>
                <span>Opt out of non-essential data processing</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-400 leading-relaxed">
              For any privacy-related questions or requests, please contact us at:
            </p>
            <p className="text-electric font-bold mt-2">privacy@taxflow-us.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
