import React from 'react';
import { Cookie, CheckCircle2 } from 'lucide-react';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-carbon py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-electric/10 rounded-xl flex items-center justify-center">
              <Cookie className="text-electric" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white">Cookies Policy</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p className="text-slate-400 leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences 
              and improving our service.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We use cookies only for essential purposes to improve your experience:
            </p>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <div>
                  <span className="font-bold text-white">Authentication:</span>
                  <span className="ml-2">Keep you logged in securely</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <div>
                  <span className="font-bold text-white">Preferences:</span>
                  <span className="ml-2">Save your report settings and dashboard preferences</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <div>
                  <span className="font-bold text-white">Security:</span>
                  <span className="ml-2">Protect against fraud and ensure secure access</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-electric flex-shrink-0 mt-1" size={20} />
                <div>
                  <span className="font-bold text-white">Performance:</span>
                  <span className="ml-2">Analyze usage to improve service speed and reliability</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Cookie Types</h2>
            <div className="space-y-4">
              <div className="bg-electric/5 border border-electric/20 rounded-xl p-4">
                <h3 className="font-bold text-electric mb-2">Essential Cookies</h3>
                <p className="text-slate-400 text-sm">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-bold text-white mb-2">Functional Cookies</h3>
                <p className="text-slate-400 text-sm">
                  Remember your preferences and settings for a better user experience.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-bold text-white mb-2">Analytics Cookies</h3>
                <p className="text-slate-400 text-sm">
                  Help us understand how you use our service to improve it.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="text-slate-400 leading-relaxed">
              We do not use third-party cookies for advertising or tracking purposes. 
              Any cookies used by our authentication providers (Google, etc.) are 
              governed by their respective privacy policies.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              You can control and manage cookies through your browser settings:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li>• View all cookies stored on your device</li>
              <li>• Delete existing cookies</li>
              <li>• Block cookies from specific websites</li>
              <li>• Enable or disable cookie notifications</li>
            </ul>
            <p className="text-slate-400 mt-4 text-sm">
              Note: Disabling essential cookies may affect the functionality of our service.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
            <p className="text-slate-400 leading-relaxed">
              We may update this cookies policy from time to time. Any changes will be 
              posted on this page with an updated revision date.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-400 leading-relaxed">
              For any questions about our use of cookies, please contact us at:
            </p>
            <p className="text-electric font-bold mt-2">privacy@taxflow-us.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
