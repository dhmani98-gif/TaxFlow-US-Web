import React from 'react';
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-carbon py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-electric/10 rounded-xl flex items-center justify-center">
              <FileText className="text-electric" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white">Terms of Service</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Service Agreement</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              By using TAXFLOW, you agree to these terms of service. TAXFLOW is a tax 
              calculation and reporting tool designed to assist with tax compliance.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={24} />
              Important Disclaimer
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              TAXFLOW is an <span className="text-electric font-bold">auxiliary tool for accounting purposes</span>. 
              While we strive for accuracy in tax calculations, the <span className="text-white font-bold">ultimate legal 
              responsibility for tax filings and compliance rests solely with you, the taxpayer</span>.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <p className="text-amber-400 font-bold mb-2">Professional Standards Compliance</p>
              <p className="text-slate-400 text-sm">
                Our calculations are designed to meet professional accounting standards, 
                but we recommend reviewing all reports with a qualified tax professional 
                before filing with tax authorities.
              </p>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">User Responsibilities</h2>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Ensure all connected store data is accurate and up-to-date</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Review all tax reports before submission to authorities</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Maintain compliance with applicable tax laws in your jurisdiction</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <span>Keep your account credentials secure</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We strive to maintain 99.9% uptime. However, we cannot guarantee 
              uninterrupted service. Scheduled maintenance will be announced in advance.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Subscription & Billing</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Subscriptions are billed monthly or annually as selected. You may cancel 
              at any time. Cancellations take effect at the end of the current billing period.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-slate-400 leading-relaxed">
              In no event shall TAXFLOW be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of 
              profits, data, use, goodwill, or other intangible losses, resulting from 
              your use of the service.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Modifications to Terms</h2>
            <p className="text-slate-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of 
              the service after modifications constitutes acceptance of the updated terms.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-400 leading-relaxed">
              For any questions about these terms, please contact us at:
            </p>
            <p className="text-electric font-bold mt-2">legal@taxflow-us.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
